# Webpacker

Gems required:
1. [Webpacker](https://github.com/rails/webpacker)
1. [Webpacker-React](https://github.com/renchap/webpacker-react)

Webpacker allows us to write javascript using ES2016 and beyond. Webpacker-React allows us to easily add react components to our pages and pass in data from our view using view helpers.  

This app comes with a **Procfile** that lets you run the webpacker dev server and the rails server at the same time:

```
foreman start -f Procfile 
```