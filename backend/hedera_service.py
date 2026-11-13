import os
import json
import time
from typing import Dict, Any, Optional, Tuple
from dotenv import load_dotenv

load_dotenv()

# Attempt importing hiero_sdk_python
try:
    from hiero_sdk_python import (
        Client,
        Network,
        AccountId,
        PrivateKey,
        TopicCreateTransaction,
        TopicMessageSubmitTransaction,
    )
    HIERO_AVAILABLE = True
except ImportError:
    HIERO_AVAILABLE = False


class HederaService:
    def __init__(self):
        self.network_name = os.getenv("HEDERA_NETWORK", "testnet")
        self.operator_id_str = os.getenv("OPERATOR_ID", "").strip()
        self.operator_key_str = os.getenv("OPERATOR_KEY", "").strip()
        self.configured_topic_id = os.getenv("HCS_TOPIC_ID", "").strip()
        self.usdc_token_id = os.getenv("USDC_TOKEN_ID", "0.0.456858").strip()
        self.escrow_contract_id = os.getenv("ESCROW_CONTRACT_ID", "").strip()
        self.demo_mode = os.getenv("DEMO_MODE", "true").lower() == "true"

        self.client = None
        self.operator_key = None
        self.operator_id = None
        self.active_topic_id = self.configured_topic_id or None

        self._initialize_client()

    def _initialize_client(self):
        """Attempts to initialize genuine hiero_sdk_python Client if credentials are provided."""
        if not HIERO_AVAILABLE:
            return

        if self.operator_id_str and self.operator_key_str and "xxxx" not in self.operator_id_str:
            try:
                self.operator_id = AccountId.from_string(self.operator_id_str)
                # Try ECDSA then ED25519
                try:
                    self.operator_key = PrivateKey.from_string_ecdsa(self.operator_key_str)
                except Exception:
                    self.operator_key = PrivateKey.from_string(self.operator_key_str)

                self.client = Client(Network(self.network_name))
                self.client.set_operator(self.operator_id, self.operator_key)
            except Exception as e:
                print(f"[HederaService] Live client init note: {e}. Falling back to demonstration mode.")
                self.client = None

    def is_live_configured(self) -> bool:
        """Returns True only if valid live credentials and client are active and demo_mode is False."""
        return (not self.demo_mode) and (self.client is not None) and (self.operator_key is not None)

    def get_status(self) -> Dict[str, Any]:
        """Provides transparency on the operational mode and network configuration."""
        is_live = self.is_live_configured()
        return {
            "demo_mode": self.demo_mode,
            "is_live_on_chain": is_live,
            "network": self.network_name,
            "operator_configured": bool(self.operator_id_str and "xxxx" not in self.operator_id_str),
            "operator_id": self.operator_id_str if is_live else "0.0.482910 (Demo Operator)",
            "active_topic_id": self.active_topic_id or "0.0.982104 (Simulated HCS Topic)",
            "usdc_token_id": self.usdc_token_id,
            "escrow_contract_id": self.escrow_contract_id or "0.0.994120 (Simulated Escrow)",
            "sdk_available": HIERO_AVAILABLE,
            "hashscan_topic_url": self.get_hashscan_topic_url(self.active_topic_id) if self.active_topic_id else None
        }

    def set_demo_mode(self, enabled: bool):
        self.demo_mode = enabled

    def get_or_create_topic(self, memo: str = "TRUSETT Payment Protection Audit Trail") -> Tuple[str, bool]:
        """
        Retrieves active topic or deploys a new HCS topic via hiero_sdk_python on Testnet.
        Returns: (topic_id_str, is_on_chain)
        """
        if self.is_live_configured():
            try:
                receipt = (
                    TopicCreateTransaction(memo=memo)
                    .freeze_with(self.client)
                    .sign(self.operator_key)
                    .execute(self.client)
                )
                topic_id = str(receipt.topic_id)
                self.active_topic_id = topic_id
                return topic_id, True
            except Exception as e:
                print(f"[HederaService] Topic creation error: {e}. Falling back to demo topic.")

        # Demo fallback
        topic_id = self.configured_topic_id or "0.0.982104"
        return topic_id, False

    def log_deal_event(
        self,
        deal_id: str,
        event_type: str,
        payload: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Publishes a deal lifecycle event to Hedera Consensus Service.
        Preserves non-sensitive metadata only; keeps private files off-chain.
        """
        timestamp = int(time.time())
        message_obj = {
            "protocol": "TRUSETT",
            "version": "1.0",
            "deal_id": deal_id,
            "event": event_type,
            "timestamp": timestamp,
            "data": payload
        }
        message_str = json.dumps(message_obj)

        if self.is_live_configured():
            try:
                topic_id = self.active_topic_id or self.get_or_create_topic()[0]
                tx_receipt = (
                    TopicMessageSubmitTransaction(
                        topic_id=AccountId.from_string(topic_id),
                        message=message_str
                    )
                    .freeze_with(self.client)
                    .sign(self.operator_key)
                    .execute(self.client)
                )

                seq_no = getattr(tx_receipt, "sequence_number", 1)
                tx_id = str(getattr(tx_receipt, "transaction_id", f"{self.operator_id_str}@{timestamp}"))

                return {
                    "is_on_chain": True,
                    "topic_id": topic_id,
                    "sequence_number": seq_no,
                    "transaction_id": tx_id,
                    "hashscan_url": f"https://hashscan.io/{self.network_name}/topic/{topic_id}",
                    "tx_hashscan_url": f"https://hashscan.io/{self.network_name}/transaction/{tx_id}"
                }
            except Exception as e:
                print(f"[HederaService] Live HCS message error: {e}. Recording simulated event.")

        # Demo mode result with clear non-misleading simulated format
        sim_topic = self.active_topic_id or "0.0.982104"
        sim_tx = f"0.0.482910@{timestamp}.000000001"
        return {
            "is_on_chain": False,
            "topic_id": sim_topic,
            "sequence_number": int(timestamp % 10000),
            "transaction_id": sim_tx,
            "hashscan_url": f"https://hashscan.io/{self.network_name}/topic/{sim_topic}",
            "tx_hashscan_url": None # Explicitly None so demo is never presented as live confirmed
        }

    def get_hashscan_topic_url(self, topic_id: str) -> str:
        return f"https://hashscan.io/{self.network_name}/topic/{topic_id}"

    def get_hashscan_tx_url(self, tx_id: str) -> str:
        return f"https://hashscan.io/{self.network_name}/transaction/{tx_id}"


hedera_service = HederaService()
