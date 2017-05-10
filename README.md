explicu
===========

# repository for explicu project

You can view the production version of the site at http://www.explicu.com. It has an intuitive user inference and the usage is self-explanatory.  There are also instructions on the site for how to proceed. There is a navigation bar at the top of the webpage which includes links to any component of the project, from any given page of the site. All visualizations on there have an interactive component. Please follow instructions laid out on the web page to proceed. 

We implemented an extensive javascript back end in order to launch a web server to host the site. If you still wish to install the software, 


1. install node.js as well as node package manager (npm). You can both of those (npm comes pre-packaged with nodejs) that here:

        https://nodejs.org/en/download
        
   If you are on Ubuntu, you can do the following:
   
        $ sudo apt-get install -y nodejs
        $ sudo apt-get install npm
   
   If you are using Mac OSX, you can either use **Homebrew** or download directly from the Node.js official website via the link above.

2. Next, clone this repository (or download, unzip it and navigate to the folder in the command line):
    
        $ git clone https://github.com/rchenmit/explicu.git
        $ cd explicu

3. Since node modules may have been updated since the time this repo was published, update the packages to the most recent version: 

        $ rm -rf node_modules/
        $ npm cache clean
        $ npm install
        
4. To start the web service, do the following:

        $ npm start

    This launches on port 8080. You can change the port via the **/bin/www** file which has the code for launching the web service with express. Replace 8080 with the desired port.
    
    
    ```javascript
    app.set('port', process.env.PORT || 8080);
    ```
5. To view the website, navigate to [http://localhost:8080/](http://localhost:8080/)
