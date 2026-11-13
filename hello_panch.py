import os
from dotenv import load_dotenv
from hiero_sdk_python import (
    Client,
    Network,
    AccountId,
    PrivateKey,
    TopicCreateTransaction,
    TopicMessageSubmitTransaction,
)

load_dotenv()

operator_id = AccountId.from_string(os.getenv("OPERATOR_ID"))
raw_key = os.getenv("OPERATOR_KEY")

# The portal usually gives an ECDSA key; older accounts use ED25519.
# Try one, then the other.
try:
    operator_key = PrivateKey.from_string_ecdsa(raw_key)
except Exception:
    operator_key = PrivateKey.from_string(raw_key)

client = Client(Network("testnet"))
client.set_operator(operator_id, operator_key)

# 1) Create the topic (the public record book)
receipt = (
    TopicCreateTransaction(memo="Panch dispute log")
    .freeze_with(client)
    .sign(operator_key)
    .execute(client)
)
topic_id = receipt.topic_id
print("Topic created:", topic_id)

# 2) Post the first message
(
    TopicMessageSubmitTransaction(
        topic_id=topic_id,
        message='{"event":"CASE_CREATED","case_id":1}',
    )
    .freeze_with(client)
    .sign(operator_key)
    .execute(client)
)
print("Message sent!")
print(f"See it on HashScan: https://hashscan.io/testnet/topic/{topic_id}")
