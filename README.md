----------------------------------------------
How to make this in the cloud using AWS EC2
----------------------------------------------

Step 1: Setting Up EC2 instance
1. Create instance in AWS 
    1.1. Name 
    1.2. server --> ubuntu
    1.3. security group, allow inbound port 80 and 443 
2. keypair 
    2.1. create new keypair 
    2.2. THIS IS IMPORTANT: dont lose the keypair.pem
    2.3. keypair is used to ssh into the ubuntu instance 
3. LAUNCH INSTANCE

********************************************

Step 2: SSH into the created instance 
1. making the keypair secured 
    1.1 locate the downloaded keypair 
    1.2 properties-->security-->advance 
    1.3 disable inheritance-->first option 
    1.4 remove everyone, but you (the use you want to ssh from)
    1.5 apply 
2. ssh 
    2.1 the command is ssh -i <path to the pem file> ubuntu@<public ipv4 addr>
    2.2 hit enter 

********************************************

Step 2: Setting up all relevant things inside the ubuntu 
1. update package list and upgrade (if outdated)
    1.1 sudo apt update 
    1.2 sudo apt upgrade -y (-y means y to all prompt)
2. install npm 
    2.1 curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        1.1.1 get script from the url and using bash, execute the script while preserving user env 
    2.2 sudo apt install nodejs -y
    2.3 why this flow? to have the latest stable nodejs, because default package repo like apt can sometimes have outdated version 
3. install redis 
    3.1 sudo apt install -y redis-server 
    3.2 sudo systemctl enable redis-server 
    3.3 sudo systemctl start redis-server 
    3.4 sudo systemctl status redis-server 
    3.5 Pretty self-explanatory 🫡

********************************************

Step 3: Setting up SSH key for connecting to github and clone repo
*This step is done inside the ubuntu*
1. generate ssh key 
    1.1 ssh-keygen -t ed25519 -C <"your.email@email.com">
2. getting the public key 
    2.1 cat ~/.ssh/id_ed25519.pub 
    2.2 this will show the key, copy it fully 
3. add ssh key to github 
    3.1 your github profile-->setting-->ssh key
    3.2 add 
4. verify connection
    4.1 ssh -t git@github.com
5. clone repo
    5.1 git clone <your_repo_ssh_url>
6. after clone, cd <repo_name>, npm install to install all the deps inside package.json
7. create .env file inside <repo_name> 
    7.1 nano .env 
    7.2 copy from local machine, modify value accordingly 

********************************************

Step 4: Install certs for https connection (if not using nginx)
**Refer to the /certs/README.md for certs installation**

********************************************

Step 5: Setting up nginx
//TODO
