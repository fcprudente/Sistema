# Sistema de Gestão de Consultório

Sistema web para gerenciamento de consultório médico, desenvolvido com HTML, CSS e JavaScript puro.

## Funcionalidades

- Cadastro e gerenciamento de pacientes
- Agendamento de consultas
- Calendário interativo
- Relatórios
- Faturamento

## Estrutura do Projeto

```
.
├── css/
│   └── main.css          # Estilos principais
├── js/
│   ├── pacientes.js      # Gerenciamento de pacientes
│   ├── agenda.js         # Gerenciamento da agenda
│   └── faturamento.js    # Gerenciamento do faturamento
├── index.html            # Página principal
└── README.md            # Este arquivo
```

## Como Usar

1. Clone o repositório
2. Abra o arquivo `index.html` em um navegador moderno
3. O sistema utiliza `localStorage` para armazenar os dados localmente

## Requisitos

- Navegador moderno com suporte a ES6+
- Conexão com internet (para carregar as fontes e ícones)

## Recursos Utilizados

- Font Awesome 5.15.4 para ícones
- API ViaCEP para busca de endereços

## Funcionalidades Principais

### Pacientes
- Cadastro completo com dados pessoais e endereço
- Busca automática de endereço por CEP
- Cálculo automático de idade
- Listagem em tabela com opções de edição e exclusão

### Agenda
- Calendário interativo
- Agendamento de consultas
- Visualização de consultas por dia
- Edição e exclusão de consultas

### Faturamento
- Geração de relatório por período
- Cálculo automático de valores
- Detalhamento de consultas
- Exportação de relatório 