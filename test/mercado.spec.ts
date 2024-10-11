import pactum from 'pactum';
import { StatusCodes } from 'http-status-codes';
import { SimpleReporter } from '../simple-reporter';

describe('Mercado APIs', () => {
  const p = pactum;
  const rep = SimpleReporter;
  const baseUrl = 'https://api-desafio-qa.onrender.com';

  p.request.setDefaultTimeout(100000);

  beforeAll(() => p.reporter.add(rep));
  afterAll(() => p.reporter.end());

  let mercadoId = 1;
  let frutaId = 1;
  let bovinoId = 1;

  describe('Verificando APIs do Mercado', () => {
    it('Criando um novo mercado', async () => {
      mercadoId = await p
        .spec()
        .post(`${baseUrl}/mercado`)
        .withJson({
          nome: `Supermercado Booleano ${Date.now()}`,
          cnpj: '80894215000132',
          endereco: 'Bairro Marisópolis - Centro, São Ludgero/SC'
        })
        .expectStatus(StatusCodes.CREATED)
        .expectHeaderContains('content-type', 'application/json')
        .returns(returned => returned.res.body.novoMercado.id);
    });

    it('Criando de um novo mercado com CNPJ inválido', async () => {
      await p
        .spec()
        .post(`${baseUrl}/mercado`)
        .withJson({
          nome: 'Mercado Mendes',
          cnpj: '808942150',
          endereco: 'Bairro Parque Das Acácias - Centro, São Ludgero/SC'
        })
        .expectStatus(StatusCodes.BAD_REQUEST)
        .expectJsonLike({
          errors: [
            {
              msg: 'CNPJ deve ter 14 dígitos'
            }
          ]
        })
        .expectHeaderContains('content-type', 'application/json');
    });

    it('Buscando todos os mercados cadastrados', async () => {
      await p
        .spec()
        .get(`${baseUrl}/mercado`)
        .expectStatus(StatusCodes.OK)
        .expectHeaderContains('content-type', 'application/json');
    });

    it('Buscando o mercado por id', async () => {
      await p
        .spec()
        .get(`${baseUrl}/mercado/${mercadoId}`)
        .expectStatus(StatusCodes.OK)
        .expectJsonLike({
          data: {
            id: mercadoId
          }
        });
    });

    it('Atualizando mercado por id', async () => {
      await p
        .spec()
        .put(`${baseUrl}/mercado/${10000}`)
        .withJson({
          nome: 'Mercado Kill',
          cnpj: '80894215000132',
          endereco: 'Bairro Marisópolis - Centro, São Ludgero/SC'
        })
        .expectStatus(StatusCodes.NOT_FOUND)
        .expectBody('O mercado com o ID fornecido não foi encontrado.');
    });

    it('Listando produtos de um mercado', async () => {
      await p
        .spec()
        .get(`${baseUrl}/mercado/${mercadoId}/produtos`)
        .expectStatus(StatusCodes.OK);
    });

    it('Cadastrando frutas em um mercado', async () => {
      frutaId = await p
        .spec()
        .post(`${baseUrl}/mercado/${mercadoId}/produtos/hortifruit/frutas`)
        .withJson({
          nome: 'Tangerina',
          valor: 5
        })
        .expectStatus(StatusCodes.CREATED)
        .returns(returned => returned.res.body.novaFruta.id);
    });

    it('Listando produtos frios de um mercado', async () => {
      await p
        .spec()
        .get(`${baseUrl}/mercado/${mercadoId}/produtos/frios/outros`)
        .expectStatus(StatusCodes.NOT_FOUND)
        .expectBody({ message: 'A key outros ainda não existe' });
    });

    it('Deletando uma fruta de um mercado', async () => {
      await p
        .spec()
        .delete(
          `${baseUrl}/mercado/${mercadoId}/produtos/hortifruit/frutas/${frutaId}`
        )
        .expectStatus(StatusCodes.OK);
    });

    it('Deletando fruta de um mercado que não existe', async () => {
      await p
        .spec()
        .delete(
          `${baseUrl}/mercado/${mercadoId}/produtos/hortifruit/frutas/${frutaId}`
        )
        .expectStatus(StatusCodes.BAD_REQUEST);
    });

    it('Cadastrando bovino no açougue do mercado', async () => {
      bovinoId = await p
        .spec()
        .post(`${baseUrl}/mercado/${mercadoId}/produtos/acougue/bovinos`)
        .withJson({
          nome: 'Paleta Bovina',
          valor: 20
        })
        .expectStatus(StatusCodes.CREATED)
        .returns(returned => returned.res.body.novoBovino.id);
    });

    it('Retornando bovinos do açougue mercado', async () => {
      await p
        .spec()
        .get(`${baseUrl}/mercado/${mercadoId}/produtos/acougue/bovinos`)
        .expectStatus(StatusCodes.OK);
    });

    it('Deletando bovino de um mercado', async () => {
      await p
        .spec()
        .delete(
          `${baseUrl}/mercado/${mercadoId}/produtos/acougue/bovinos/${bovinoId}`
        )
        .expectStatus(StatusCodes.OK);
    });

    it('Retornando todas as massas de um mercado', async () => {
      await p
        .spec()
        .get(`${baseUrl}/mercado/${mercadoId}/produtos/mercearia/massas`)
        .expectStatus(StatusCodes.NOT_FOUND)
        .expectBody({ message: 'A key massas ainda não existe' });
    });

    it('Testando API que não existe', async () => {
      await p
        .spec()
        .post(`${baseUrl}/mercado/${mercadoId}/produtos/mercearia/gelo`)
        .withJson({
          nome: 'Macarrão do Zé',
          valor: 10
        })
        .expectStatus(StatusCodes.NOT_FOUND);
    });
  });
});
