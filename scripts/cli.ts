#!/usr/bin/env ts-node
import { Command } from 'commander';
import fs from 'fs';
import path from 'path';

const program = new Command();

program
  .command('make:controller <name>')
  .description('Cria um controller TypeScript com estrutura base')
  .action((name: string) => {
    const className = `${capitalize(name)}Controller`;
    const content = 
`import { Request, Response } from 'express';

export class ${className} {
  async index(req: Request, res: Response): Promise<void> {
    // Listar recursos
  }

  async show(req: Request, res: Response): Promise<void> {
    // Mostrar recurso
  }

  async store(req: Request, res: Response): Promise<void> {
    // Criar recurso
  }

  async update(req: Request, res: Response): Promise<void> {
    // Atualizar recurso
  }

  async destroy(req: Request, res: Response): Promise<void> {
    // Deletar recurso
  }
}
`;

    const dir = path.resolve(__dirname, '../src/controllers');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const filePath = path.join(dir, `${className}.ts`);
    if (fs.existsSync(filePath)) {
      console.log(`❌ O controller ${className} já existe.`);
    } else {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Controller ${className} criado com sucesso.`);
    }
  });

program.parse(process.argv);

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
