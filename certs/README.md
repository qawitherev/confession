┌───────────┐                                  ┌───────────┐
│  Browser  │                                  │  Server   │
└───────────┘                                  └───────────┘
      │                                              │
      │ Hello, I want to connect securely            │
      ├─────────────────────────────────────────────►│
      │                                              │
      │ Here's my certificate (cert.pem)             │
      │◄─────────────────────────────────────────────┤
      │                                              │
      │ Checks certificate                           │
      │ (Shows warning if self-signed)               │
      │                                              │
      │ Generates random session key                 │
      │                                              │
      │ Encrypts session key with server's public key│
      │ from cert.pem                                │
      │                                              │
      │ Here's the encrypted session key             │
      ├─────────────────────────────────────────────►│
      │                                              │
      │                               Decrypts using │
      │                              private key from│
      │                                     key.pem  │
      │                                              │
      │ From now on, both sides use session key      │
      │ for encrypting and decrypting all data       │
      │                                              │
      │ "Hello" (encrypted with session key)         │
      ├─────────────────────────────────────────────►│
      │                                              │
      │ "Welcome" (encrypted with session key)       │
      │◄─────────────────────────────────────────────┤
      │                                              │



command: 
openssl req --x509 --newkey rsa:2048 --keyout key.pem -out cert.pem -days 365 -nodes

openssl req: Starts the certificate request process
-x509: Creates a self-signed certificate (instead of a certificate request)
-newkey rsa:2048: Generates a new 2048-bit RSA key pair
-keyout certs/key.pem: Saves the private key to the file certs/key.pem
-out certs/cert.pem: Saves the certificate to the file certs/cert.pem
-days 365: Makes the certificate valid for 365 days (1 year)
-nodes: Creates a key without a passphrase (No DES encryption)
