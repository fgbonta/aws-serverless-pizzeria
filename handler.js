'use strict';

const { v4: uuidv4 } = require('uuid');
const { SQSClient, SendMessageCommand } = require("@aws-sdk/client-sqs");

const sqs = new SQSClient({ region: process.env.REGION }); // llama al modulo
const queueUrl = process.env.PENDING_ORDERS_QUEUE; // la url de la cola

const hacerPedido = async (event) => {

  try {

    console.log('fn hacerPedido fue llamada');

    const orderId = uuidv4();
    let response;

    const body = JSON.parse(event.body);
    const name = body?.name ?? null;
    const address = body?.address ?? null;
    const phone = body?.phone ?? null;
    const email = body?.email ?? null;
    const order = body?.order ?? [];

    if(!name || !address || !phone || !email || order.length === 0){
      return {
        statusCode: 400,
        body: JSON.stringify('Bad Request'),
        headers: {
          'Content-Type': 'application/json'
        }
      };
    }

    const params = {
      MessageBody: JSON.stringify({ 
        orderId,
        name, 
        address, 
        phone, 
        email, 
        order,
        timeStamp: new Date().getTime(),
      }),
      QueueUrl: queueUrl,
    }

    const data = await sqs.send(new SendMessageCommand(params));

    if (data) {

      response = {
        statusCode: 200,
        body: JSON.stringify(
          {
            message: `El pedido fue registrado con el número de orden: ${orderId}`,
            messageIdQueue: data.MessageId,
          }
        ),
        headers: {
          'Content-Type': 'application/json'
        }
      };

    } else {

      response = {
        statusCode: 500,
        body: JSON.stringify('Some error occured !!'),
        headers: {
          'Content-Type': 'application/json'
        }
      };

    }

    return response;

  } catch (error) {

    console.log(error);

    return {
      statusCode: 500,
      body: JSON.stringify('Internal Server Error'),
      headers: {
        'Content-Type': 'application/json'
      }
    };

  };

}

const prepararPedido = (event, context, callback) => {

  console.log('fn prepararPedido fue llamada');  

  console.log(event);  

  callback();

}

module.exports = { hacerPedido, prepararPedido };
