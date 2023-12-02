:: para gerar as chaves execute esse arquivo com um duplo clique

:: Gerar a chave privada 
openssl genpkey -algorithm RSA -out private_key.pem -pkeyopt rsa_keygen_bits:2048

:: Gerar a chave pública
openssl rsa -pubout -in private_key.pem -out public_key.pem

:: Converter a chave privada para base64 e salvar na variável PRIVATE_KEY
PRIVATE_KEY=$(openssl base64 -in private_key.pem -A)

:: Converter a chave publica para base64 e salvar na variável PUBLIC_KEY
PUBLIC_KEY=$(openssl base64 -in public_key.pem -A)

:: Adicionar as chaves ao arquivo .env
echo "\n" >> .env
echo "JWT_PRIVATE_KEY=\"$PRIVATE_KEY\"" >> .env
echo "JWT_PUBLIC_KEY=\"$PUBLIC_KEY\"" >> .env

:: remover os arquivos de chave
rm private_key.pem public_key.pem
