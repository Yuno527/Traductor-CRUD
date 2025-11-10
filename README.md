Aqui esta la base de datos (super simple):
CREATE TABLE palabras (
  id SERIAL PRIMARY KEY,
  palabra_origen VARCHAR(100) NOT NULL,
  palabra_traducida VARCHAR(100) NOT NULL,
  idioma_origen VARCHAR(50),
  idioma_destino VARCHAR(50)
);

La base de datos es en PostgreSQL con docker
Comando para crearlo:
docker run --name postgres-traductor \
-e POSTGRES_USER=postgres \
-e POSTGRES_PASSWORD=12345 \
-e POSTGRES_DB=traductor_db \
-p 5432:5432 \
-d postgres

Comando para correrlo:
docker exec -it postgres-traductor psql -U postgres -d traductor_db
