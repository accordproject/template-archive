### To create a new keystore from scratch

```
openssl genrsa -out key.pem 2048
openssl req -new -sha256 -key key.pem -out csr.csr // enter 'password' for: A challenge password []:password
openssl req -x509 -sha256 -days 365 -key key.pem -in csr.csr -out certificate.pem
openssl pkcs12 -export -out keystore.p12 -inkey key.pem -in certificate.pem // enter 'password' when challenged
```
