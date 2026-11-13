import os
import json
from dotenv import load_dotenv
from hiero_sdk_python import (
    Client, Network, AccountId, TokenId, TopicId, PrivateKey,
    TransferTransaction,
    TopicMessageSubmitTransaction,
)

load_dotenv()

operator_id = AccountId.from_string(os.getenv("OPERATOR_ID"))
raw_key = os.getenv("OPERATOR_KEY")
try:
    operator_key = PrivateKey.from_string_ecdsa(raw_key)
except Exception:
    operator_key = PrivateKey.from_string(raw_key)

client = Client(Network("testnet"))
client.set_operator(operator_id, operator_key)

# Lire les comptes créés par setup_panch.py
with open("accounts.json") as f:
    data = json.load(f)

token_id = TokenId.from_string(data["token_id"])
buyer_id = AccountId.from_string(data["accounts"]["buyer"]["id"])
escrow_id = AccountId.from_string(data["accounts"]["escrow"]["id"])
buyer_key = PrivateKey.from_string(data["accounts"]["buyer"]["key"])

TOPIC_ID = TopicId.from_string("0.0.11443206")
AMOUNT = 10 * 10**6  # 10 tUSDC

# 1) L'acheteur envoie les tUSDC à l'escrow
(
    TransferTransaction()
    .add_token_transfer(token_id, buyer_id, -AMOUNT)
    .add_token_transfer(token_id, escrow_id, AMOUNT)
    .freeze_with(client)
    .sign(buyer_key)
    .sign(operator_key)
    .execute(client)
)
print("10 tUSDC verrouillés dans l'escrow")

# 2) On note l'événement dans le journal public
message = json.dumps({
    "event": "FUNDS_LOCKED",
    "case_id": 1,
    "amount": "10 tUSDC",
    "buyer": str(buyer_id),
    "escrow": str(escrow_id),
})
(
    TopicMessageSubmitTransaction(topic_id=TOPIC_ID, message=message)
    .freeze_with(client)
    .sign(operator_key)
    .execute(client)
)
print("Événement publié sur HCS")
print("Journal : https://hashscan.io/testnet/topic/0.0.11443206")
print(f"Compte escrow : https://hashscan.io/testnet/account/{escrow_id}")
