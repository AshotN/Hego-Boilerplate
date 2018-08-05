var express = require('express');
var app = express();
var path = require('path');

app.use('/images', express.static(path.join(__dirname, '../dist/images/')));
app.use('/styles', express.static(path.join(__dirname, '../dist/styles/')));
app.set('view engine', 'pug');
app.set('views', './app/views');

app.get('/', (req, res) => {
	res.render('index', { title: 'Hego Boilerplate | Index', currentPage: 'Home' })
});


// Handle 404
app.get('*', (req, res) => {
	res.status(404).send('404: Page not Found');
});

// Handle 500
app.use((error, req, res, next) =>  {
	res.status(500).send('500: Internal Server Error', 500);
});

app.listen(5000);
console.log("Express on port 5000");
