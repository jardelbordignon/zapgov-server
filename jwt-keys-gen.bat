@echo off
:: Para gerar as chaves, execute este arquivo com um duplo clique

:: Gerar a chave privada 
openssl genpkey -algorithm RSA -out private_key.pem -pkeyopt rsa_keygen_bits:2048

:: Gerar a chave pública
openssl rsa -pubout -in private_key.pem -out public_key.pem

:: Converter a chave privada para base64
openssl base64 -in private_key.pem -out private_key_base64.txt

:: Converter a chave pública para base64
openssl base64 -in public_key.pem -out public_key_base64.txt

:: aguardar 2 segundos para garantir que as chaves já estejam criadas
timeout /nobreak /t 2 > nul

:: Adicionar as chaves ao arquivo .env
echo. >> .env
set /p PRIVATE_KEY=<private_key_base64.txt
set /p PUBLIC_KEY=<public_key_base64.txt
echo JWT_PRIVATE_KEY="%PRIVATE_KEY%" >> .env
echo JWT_PUBLIC_KEY="%PUBLIC_KEY%" >> .env

:: Remover os arquivos de chave
del private_key.pem public_key.pem private_key_base64.txt public_key_base64.txt
