# Visão Geral e Objetivo

O sistema é uma plataforma completa para gerenciamento de pessoas e documentos com foco no RPG de Naruto.
Todos os dados são oriundos do WhatsApp e das fichas de Jutsus/Invocações do Drive.
O objetivo final é ter tudo migrado para o sistema, desde o drive até a relação de ninjas e pessoas que estão usando-os, além disso o sistema
evoluirá para uma plataforma completa com o tempo, em que funcionará tanto como compras de jutsus, adição de salários e tudo que envolva a lista de Ryo.

# Arquitetura

O sistema será uma aplicação fullstack em **Next.js** com **Supabase**, sendo assim todas as regras de negócio e integrações com o Supabase serão feitas no próprio Next.js.
- Frontend: **Next.js** com **Tailwind**.
- Backend: **Next.js**.
- Banco de dados: **Supabase**.

## Entidades do Banco de Dados (Modelo Lógico)

As principais entidades do sistema estão mapeados nessa [modelagem](docs/2-banco-de-dados.md).