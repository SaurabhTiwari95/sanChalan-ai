import subprocess
import os
import sys

# This wrapper script starts the Node.js backend
# The supervisor is configured to run this Python file, which then starts Node.js

os.chdir('/app/node-backend')
subprocess.run(['node', 'server.js'], check=True)
