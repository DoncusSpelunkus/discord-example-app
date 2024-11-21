import 'dotenv/config';
import { InstallGlobalCommands } from './utils.js';


// Simple test command
const TEST_COMMAND = {
  name: 'test',
  description: 'Basic command',
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 1, 2],
};

const SEND_ITEM_COMMAND = {
  name: 'send-item',
  description: 'Send an item to another user',
  type: 1,
  integration_types: [0, 1],
  options: [
    {
      type: 6,
      name: 'user',
      description: 'User to send the item to',
      required: true,
    },
  ]

}

const ALL_COMMANDS = [TEST_COMMAND, SEND_ITEM_COMMAND];

InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);
