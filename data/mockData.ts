import { Client, AlertContact, ClientStatus } from '../types';

export const initialClients: Client[] = [
  {
    id: 'CLI001',
    status: ClientStatus.ACTIVE,
    userData: {
      fullName: 'Ana Silva',
      email: 'ana.silva@example.com',
      birthDate: '1990-05-15',
      role: 'user',
    },
    paymentData: {
      cpf: '111.222.333-44',
      cep: '01001-000',
      address: 'Praça da Sé',
      number: '100',
      complement: 'Lado par',
      district: 'Sé',
      city: 'São Paulo',
      state: 'SP',
    },
    subscription: { package: 3, hasAiAddon: true },
    imageGenerationCount: 15,
  },
  {
    id: 'CLI002',
    status: ClientStatus.PAUSED,
    userData: {
      fullName: 'Bruno Costa',
      email: 'bruno.costa@example.com',
      birthDate: '1985-11-20',
      role: 'user',
    },
    paymentData: {
      cpf: '222.333.444-55',
      cep: '20031-050',
      address: 'Rua Uruguaiana',
      number: '55',
      complement: '',
      district: 'Centro',
      city: 'Rio de Janeiro',
      state: 'RJ',
    },
    subscription: { package: 2, hasAiAddon: false },
    imageGenerationCount: 0,
  },
  {
    id: 'CLI003',
    status: ClientStatus.BLOCKED,
    userData: {
      fullName: 'Carlos de Souza',
      email: 'carlos.souza@example.com',
      birthDate: '1992-02-10',
      role: 'user',
    },
    paymentData: {
        cpf: '333.444.555-66',
        cep: '70150-900',
        address: 'Praça dos Três Poderes',
        number: 's/n',
        complement: '',
        district: 'Zona Cívico-Administrativa',
        city: 'Brasília',
        state: 'DF',
    },
    subscription: { package: 1, hasAiAddon: true },
    imageGenerationCount: 45,
  },
  {
    id: 'CLI004',
    status: ClientStatus.IN_DEFAULT,
    userData: {
      fullName: 'Daniela Ferreira',
      email: 'daniela.ferreira@example.com',
      birthDate: '1998-09-30',
      role: 'user',
    },
    paymentData: {
        cpf: '444.555.666-77',
        cep: '40026-010',
        address: 'Largo do Pelourinho',
        number: '12',
        complement: '',
        district: 'Pelourinho',
        city: 'Salvador',
        state: 'BA',
    },
    subscription: { package: 3, hasAiAddon: false },
    imageGenerationCount: 0,
  },
  {
    id: 'CLI005',
    status: ClientStatus.ACTIVE,
    userData: {
      fullName: 'Eduardo Lima',
      email: 'eduardo.lima@example.com',
      birthDate: '1988-07-22',
      role: 'user',
    },
    paymentData: {
        cpf: '555.666.777-88',
        cep: '80020-320',
        address: 'Rua XV de Novembro',
        number: '1299',
        complement: 'Andar 5',
        district: 'Centro',
        city: 'Curitiba',
        state: 'PR',
    },
    subscription: { package: 1, hasAiAddon: false },
    imageGenerationCount: 0,
  }
];

export const initialAlertContacts: AlertContact[] = [
    {
        id: 'AC001',
        name: 'Equipe de Suporte',
        email: 'suporte@simplifika.post',
        whatsapp: '+5511987654321',
    },
    {
        id: 'AC002',
        name: 'Desenvolvedor Principal',
        email: 'dev@simplifika.post',
        whatsapp: '+5521912345678',
    }
];