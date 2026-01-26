// global-setup.ts
import { spawn } from 'child_process';

let previewProcess: any;

async function globalSetup() {
  // Start the Vite preview server as a child process
  console.log('Starting Vite preview server...');
  previewProcess = spawn('yarn', ['preview'], {
    stdio: 'inherit', // Inherit stdio to show server output
    shell: true, // Use shell to ensure compatibility across environments
  });

  // Wait for the preview server to be ready (give it a few seconds)
  await new Promise((resolve) => setTimeout(resolve, 10_000));

  return async () => {
    console.log('Stopping Vite preview server...');
    previewProcess.kill(); // Kill the child process when tests are done
  };
}

export default globalSetup;
