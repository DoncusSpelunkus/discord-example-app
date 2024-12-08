import 'dotenv/config';
import express from 'express';
import {
  InteractionType,
  InteractionResponseType,
  verifyKeyMiddleware,
  MessageComponentTypes,
} from 'discord-interactions';
import { getRandomEmoji } from './utils.js';
import { invoke } from './langchain.js'

// --Setup--
const app = express();
const PORT = process.env.PORT || 3000;
// --Setup-- END

// --Routes--
app.post('/interactions', verifyKeyMiddleware(process.env.PUBLIC_KEY), async function (req, res) {
  // --Parse request body--
  const { type, data } = req.body;
  const custom_id = data.custom_id;
  console.log("type", type);
  // --Parse request body-- END


  // --Handle TYPE 1--
  if (type === InteractionType.PING) {
    return res.send({ type: InteractionResponseType.PONG });
  }
  // --Handle TYPE 1-- END

  // --Handle TYPE 3-- [Message Components]
  if (type === InteractionType.MESSAGE_COMPONENT) {

    const componentId = data.custom_id;

    if (componentId.startsWith('incomming_item_')) {
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: { content: resultStr },
      });
    }
  }
  // --Handle TYPE 3-- END


  // --Handle TYPE 2-- [Slash Commands]
  if (type === InteractionType.APPLICATION_COMMAND) {
    const { name } = data;

    // "test" command
    if (name === 'test') {
      // Send a message into the channel where command was triggered from
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          // Fetches a random emoji to send from a helper function
          content: `hello world ${getRandomEmoji()}`,
        },
      });
    }
    if (name === 'send-item') {
      const user = data.options?.[0]?.value;
      try {
        // Send a modal to the user to input the item name
        return res.send({
          
          type: InteractionResponseType.MODAL,
          data: {
            custom_id: `send_item_modal_${user}`,
            title: 'Send Item',
            components: [
              {
                type: MessageComponentTypes.ACTION_ROW,
                components: [
                  {
                    type: MessageComponentTypes.INPUT_TEXT,
                    placeholder: 'Item Name',
                    custom_id: `item_name_${user}`,
                    style: 1,
                    label: 'Item Name',
                    required: true,
                    value: 'Item Name',
                  },
                ],
              },
            ],
          },
        });
      } catch (error) {
        console.error('Error sending modal', error);
        return res.status(500).json({ error: 'Error sending modal' });
      }
    }
    console.error(`unknown command: ${name}`);
    return res.status(400).json({ error: 'unknown command' });
  }

  if (type === InteractionType.MODAL_SUBMIT) {
    if (custom_id.startsWith('send_item_modal_')) {
      const userId = custom_id.replace('send_item_modal_', '');
      const itemName =  data.components[0].components[0].value;
      let response = await invoke(itemName)

      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `Item ${response} sent to user ${userId}`,
        },
      });
    }
  }

  // --Handle TYPE 2-- END
  console.error('unknown interaction type', type);
  return res.status(400).json({ error: 'unknown interaction type' });
});


// --Routes-- END

app.listen(PORT, () => {
  console.log('Listening on port', PORT);
});


app.get('/', (req, res) => {
  res.send('Hello World!');
});