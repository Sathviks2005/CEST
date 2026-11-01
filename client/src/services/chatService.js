import API from './api';

export const chatService = {
  /**
   * Sends user conversation history and optional assessment context to the server.
   *
   * @param {{ messages: Array<{role: string, content: string}>, context?: { instrument?: string, severity?: string } }} payload
   * @returns {Promise<{ success: boolean, reply: string, crisis?: boolean }>}
   */
  sendMessage: async ({ messages, context }) => {
    const response = await API.post('/chat', { messages, context });
    return response.data;
  },
};
