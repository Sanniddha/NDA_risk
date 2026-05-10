# ClauseGuard Deployment Guide (AWS EC2)

This guide explains how to deploy the ClauseGuard project on an AWS EC2 Ubuntu server using:

- FastAPI backend
- React frontend
- Nginx reverse proxy
- Ollama local LLM

---

# 1. Launch AWS EC2 Instance

## Steps

1. Log in to AWS Console
2. Open EC2 Dashboard
3. Click **Launch Instance**
4. Choose:

```text
Ubuntu Server 22.04 LTS
```

5. Select instance type:


```text
t3.small
```

or

```text
t3.medium
```

(Recommended for running local LLMs)

6. Configure Security Group

Allow these inbound ports:

| Type | Port |
|------|------|
| SSH | 22 |
| HTTP | 80 |
| HTTPS | 443 |
| Custom TCP | 8000 (optional for FastAPI docs/testing) |

7. Download the `.pem` key securely

---

# 2. Connect to EC2

From local terminal:

```bash
ssh -i your-key.pem ubuntu@YOUR_PUBLIC_IP
```

Example:

```bash
ssh -i risk_rsa.pem ubuntu@16.170.141.202
```

---

# 3. Install Required Packages

Update Ubuntu packages:

```bash
sudo apt update
```

Install required software:

```bash
sudo apt install -y nginx python3 python3-venv python3-pip curl git
```

---

# 4. Install Node.js

Install Node.js 20:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install nodejs -y
```

Verify:

```bash
node -v
npm -v
```

---

# 5. Install Ollama

Install Ollama:

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

Verify installation:

```bash
ollama --version
```

---

# 6. Enable Ollama Service

Enable auto-start:

```bash
sudo systemctl enable ollama
sudo systemctl start ollama
```

Check status:

```bash
sudo systemctl status ollama
```

---

# 7. Pull AI Model

For low-RAM EC2 instances, use lightweight models.

Recommended:

```bash
ollama pull qwen2:1.5b
```

Alternative (less accurate):

```bash
ollama pull tinyllama
```

Verify:

```bash
ollama list
```

Test model:

```bash
ollama run qwen2:1.5b
```

Exit:

```text
/bye
```

---

# 8. Clone Project Repository

Clone project:

```bash
git clone YOUR_GITHUB_REPO
```

Example:

```bash
git clone https://github.com/Sanniddha/NDA_risk.git
```

---

# 9. Backend Setup

Go to backend directory:

```bash
cd ~/NDA_risk/backend
```

Create virtual environment:

```bash
python3 -m venv venv
```

Activate virtual environment:

```bash
source venv/bin/activate
```

Install Python dependencies:

```bash
pip install -r requirements.txt
```

---


# 10. Create FastAPI Service

Create systemd service:

```bash
sudo nano /etc/systemd/system/fastapi.service
```

Add:

```ini
[Unit]
Description=FastAPI application
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/NDA_risk/backend
ExecStart=/home/ubuntu/NDA_risk/backend/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
```

---

# 11. Start FastAPI Service

Reload systemd:

```bash
sudo systemctl daemon-reload
```

Enable auto-start:

```bash
sudo systemctl enable fastapi
```

Start service:

```bash
sudo systemctl start fastapi
```

Check status:

```bash
sudo systemctl status fastapi
```

---

# 12. Test Backend

Test locally:

```bash
curl http://127.0.0.1:8000
```

Expected:

```json
{"status":"ClauseGuard API running","model":"qwen2:1.5b (local)"}
```

---

# 13. Configure Nginx

Create config:

```bash
sudo nano /etc/nginx/sites-available/fastapi
```

Add:

```nginx
server {
    listen 80;
    server_name YOUR_PUBLIC_IP;

    client_max_body_size 50M;

    location /api/ {
        proxy_pass http://127.0.0.1:8000/;

        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Connection "";

        proxy_buffering off;
        proxy_request_buffering off;

        proxy_connect_timeout 600s;
        proxy_send_timeout 600s;
        proxy_read_timeout 600s;
        send_timeout 600s;
    }

    location / {
        root /var/www/html;
        index index.html;
        try_files $uri /index.html;
    }
}
```

Replace:

```text
YOUR_PUBLIC_IP
```

with your EC2 public IP.

---

# 14. Enable Nginx Config

Enable config:

```bash
sudo ln -s /etc/nginx/sites-available/fastapi /etc/nginx/sites-enabled/
```

Remove default config:

```bash
sudo rm /etc/nginx/sites-enabled/default
```

Test config:

```bash
sudo nginx -t
```

Enable auto-start:

```bash
sudo systemctl enable nginx
```

Restart Nginx:

```bash
sudo systemctl restart nginx
```

---

# 15. Frontend Setup

Go to frontend:

```bash
cd ~/NDA_risk/frontend
```

Install packages:

```bash
npm install
```

Give Vite executable permission:

```bash
chmod +x node_modules/.bin/vite
```

Build frontend:

```bash
npm run build
```

After build completes, a folder named:

```text
dist/
```

will be created.

---

# 16. Deploy React Frontend

Copy build files to Nginx:

```bash
sudo cp -r dist/* /var/www/html/
```

Restart Nginx:

```bash
sudo systemctl restart nginx
```

---

# 17. Open Website

Visit:

```text
http://YOUR_PUBLIC_IP
```

Your ClauseGuard frontend should now load successfully.

---

# 18. Monitor Logs

FastAPI logs:

```bash
journalctl -u fastapi -f
```

Nginx logs:

```bash
sudo tail -f /var/log/nginx/error.log
```

---

# 19. Useful Commands

Restart FastAPI:

```bash
sudo systemctl restart fastapi
```

Restart Nginx:

```bash
sudo systemctl restart nginx
```

Restart Ollama:

```bash
sudo systemctl restart ollama
```

Check RAM usage:

```bash
free -h
```

Check port usage:

```bash
sudo lsof -i :8000
```

---

# 20. Set Up CI/CD with GitHub Actions

**CI (Continuous Integration)** and **CD (Continuous Deployment / Delivery)** are automation workflows provided by GitHub Actions.

GitHub Actions automatically runs tasks whenever code changes are pushed to GitHub.

---

# Why Use CI/CD?

## Without CI/CD

Every time you change code:

1. Write code
2. Push to GitHub
3. SSH into EC2 manually
4. Pull latest code
5. Restart services manually

This process is repetitive and error-prone.

---

## With CI/CD

1. Write code
2. Push to GitHub
3. GitHub automatically:
   - checks code
   - builds frontend
   - deploys latest code to EC2
   - restarts services

Deployment becomes automatic.

---

# What CI Does

CI (Continuous Integration) automatically checks whether your code works.

Typical CI tasks:

- install dependencies
- verify syntax
- build frontend
- check imports
- run tests

If something fails, GitHub Actions marks the workflow as failed.

---

# What CD Does

CD (Continuous Deployment) automatically deploys the latest code to your AWS EC2 server after successful CI.

This removes the need to manually SSH into the server after every code update.

---

# 21. Create GitHub Actions Folder

Go to your project root:

```bash
cd ~/NDA_risk
```

Create GitHub workflow directory:

```bash
mkdir -p .github/workflows
```

---

# 22. Create CI Workflow

Create CI file:

```bash
nano .github/workflows/ci.yml
```

Paste:

```yaml
name: CI

on:
  push:
  pull_request:

jobs:

  backend-test:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Code
        uses: actions/checkout@v3

      - name: Set Up Python
        uses: actions/setup-python@v4
        with:
          python-version: "3.10"

      - name: Install Backend Dependencies
        run: |
          cd backend
          python -m venv venv
          source venv/bin/activate
          pip install --upgrade pip
          pip install -r requirements.txt

      - name: Check Backend Imports
        run: |
          cd backend
          source venv/bin/activate
          python -c "import main"

  frontend-build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Code
        uses: actions/checkout@v3

      - name: Set Up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 20

      - name: Install Frontend Dependencies
        run: |
          cd frontend
          npm install

      - name: Build Frontend
        run: |
          cd frontend
          npm run build
```

Save:

```text
CTRL + O
ENTER
CTRL + X
```

---

# 23. Create CD Workflow

Create deployment workflow:

```bash
nano .github/workflows/cd.yml
```

Paste:

```yaml
name: CD

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Deploy to EC2
        uses: appleboy/ssh-action@master

        with:
          host: ${{ secrets.SERVER_IP }}
          username: ubuntu
          key: ${{ secrets.SSH_PRIVATE_KEY }}

          script: |
            cd /home/ubuntu/NDA_risk

            git pull origin main

            # Backend
            cd backend

            source venv/bin/activate

            pip install -r requirements.txt

            sudo systemctl restart fastapi

            # Frontend
            cd ../frontend

            export PATH=$PATH:/usr/bin

            npm install

            npm run build

            sudo cp -r dist/* /var/www/html/

            sudo systemctl restart nginx
```

Save:

```text
CTRL + O
ENTER
CTRL + X
```

---

# 24. Add GitHub Secrets

Go to your GitHub repository:

```text
Repository → Settings → Secrets and variables → Actions
```

Add these secrets:

| Secret Name | Value |
|---|---|
| SERVER_IP | Your EC2 public IP |
| SSH_PRIVATE_KEY | Content of your `.pem` private key |

---

# Important: SSH_PRIVATE_KEY

Open your `.pem` file locally and copy the entire content:

```text
-----BEGIN OPENSSH PRIVATE KEY-----
...
-----END OPENSSH PRIVATE KEY-----
```

Paste it into GitHub Secrets.

---

# 25. Test CI/CD Pipeline

Commit and push workflow files:

```bash
git add .
git commit -m "Set up CI/CD"
git push origin main
```

---

# 26. Verify GitHub Actions

Open GitHub repository:

```text
Repository → Actions
```

You should see:

- CI workflow running
- CD workflow running

If successful:

- backend will restart automatically
- frontend will rebuild automatically
- latest code will deploy automatically

---

# 27. Verify Application on EC2

SSH into EC2:

```bash
ssh -i your-key.pem ubuntu@YOUR_PUBLIC_IP
```

Check FastAPI:

```bash
sudo systemctl status fastapi
```

Check Nginx:

```bash
sudo systemctl status nginx
```

Check Ollama:

```bash
sudo systemctl status ollama
```

---

# CI/CD Deployment Complete

Your application now supports automatic deployment using GitHub Actions.

# Recommended EC2 Sizes

| Instance | Recommendation |
|---|---|
| t2.micro | Too small |
| t3.small | Minimum usable |
| t3.medium | Recommended |
| t3.large | Better for larger models |

---

# Recommended Models

| Model | RAM Requirement | Quality |
|---|---|---|
| tinyllama | Very low | Weak |
| qwen2:1.5b | Low | Good |
| phi3:mini | Medium | Very good |
| mistral | High | Excellent |

---

# Deployment Complete

Your ClauseGuard application should now support:

- PDF contract analysis
- URL analysis
- Text analysis
- Local AI inference with Ollama
- React frontend
- FastAPI backend
- Nginx reverse proxy
