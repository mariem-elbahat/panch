import os
import json
from dotenv import load_dotenv
from hiero_sdk_python import (
    Client, Network, AccountId, PrivateKey, Hbar,
    AccountCreateTransaction,
    TokenCreateTransaction,
    TokenAssociateTransaction,
    TransferTransaction,
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


def new_key():
    try:
        return PrivateKey.generate_ed25519()
    except Exception:
        return PrivateKey.generate("ed25519")


def create_account(name):
    key = new_key()
    receipt = (
        AccountCreateTransaction(
            key=key.public_key(),
            initial_balance=Hbar(5),
            memo=f"Panch {name}",
        )
        .freeze_with(client)
        .sign(operator_key)
        .execute(client)
    )
    print(f"{name} account:", receipt.account_id)
    return receipt.account_id, key


receipt = (
    TokenCreateTransaction()
    .set_token_name("Test USDC")
    .set_token_symbol("tUSDC")
    .set_decimals(6)
    .set_initial_supply(1_000_000 * 10**6)
    .set_treasury_account_id(operator_id)
    .freeze_with(client)
    .sign(operator_key)
    .execute(client)
)
token_id = receipt.token_id
print("Token created:", token_id)

# 2) Les 6 comptes
names = ["buyer", "seller", "escrow", "juror1", "juror2", "juror3"]
accounts = {}
for name in names:
    accounts[name] = create_account(name)

# 3) Associer le token à chaque compte
for name, (acc_id, key) in accounts.items():
    (
        TokenAssociateTransaction(account_id=acc_id, token_ids=[token_id])
        .freeze_with(client)
        .sign(key)
        .sign(operator_key)
        .execute(client)
    )
    print(f"Token associated with {name}")

# 4) 100 tUSDC pour l'acheteur
buyer_id = accounts["buyer"][0]
(
    TransferTransaction()
    .add_token_transfer(token_id, operator_id, -100 * 10**6)
    .add_token_transfer(token_id, buyer_id, 100 * 10**6)
    .freeze_with(client)
    .sign(operator_key)
    .execute(client)
)
print("Buyer received 100 tUSDC")

# 5) Sauvegarde pour les prochaines étapes
data = {
    "token_id": str(token_id),
    "accounts": {
        n: {"id": str(a), "key": k.to_string()} for n, (a, k) in accounts.items()
    },
}
with open("accounts.json", "w") as f:
    json.dump(data, f, indent=2)

print("Saved to accounts.json")
print("Token on HashScan: https://hashscan.io/testnet/token/{token_id}")
