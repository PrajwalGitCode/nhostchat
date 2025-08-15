
export async function triggerN8nWorkflow(data) {

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ status: 'success', message: 'n8n workflow triggered', data });
    }, 500);
  });
}
