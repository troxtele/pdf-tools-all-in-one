# Specify the base image for the container
FROM debian:stable

# Update package lists
RUN apt-get update

# Install build tools and dependencies
RUN apt-get update && apt-get install -y build-essential autoconf automake libtool


RUN apt-get install -y wget 

# Download ghostscript-10.01.2
RUN wget https://github.com/ArtifexSoftware/ghostpdl-downloads/releases/download/gs10012/ghostscript-10.01.2.tar.gz

# Extract the downloaded tarball
RUN tar -zxvf ghostscript-10.01.2.tar.gz

# Navigate to the Ghostscript source directory
WORKDIR /ghostscript-10.01.2

# Configure Ghostscript
RUN ./configure

# Build Ghostscript
RUN make

# Install Ghostscript
RUN make install

# Install libreoffice
RUN apt-get install -y libreoffice 

# Install qpdf
RUN apt-get install -y qpdf 

RUN apt-get install -y fontconfig

# Install Node.js dependencies
RUN apt-get install -y nodejs npm


#This line sets the working directory for the container to /app.
WORKDIR /app 

#This line copies the package.json file from the host machine to the container's working directory.
COPY package.json .

#This line installs the Node.js dependencies listed in package.json.
RUN npm install

#This line copies the rest of the application files from the host machine to the container's working directory.
COPY . .

# Create the directory to store TrueType fonts
RUN mkdir -p /usr/share/fonts/truetype/

# Copy the fonts to the directory
COPY Fonts/* /usr/share/fonts/truetype/

# Rebuild font cache
RUN fc-cache -f -v

#This line runs the build command defined in the application's package.json file.
RUN npm run build

#This line exposes port 3000 from the container.
EXPOSE 3000

#This line specifies the command to run when the container is started, which is to run the start command defined in the application's package.json file using npm run.
CMD ["npm", "run", "start"]
