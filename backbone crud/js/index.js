// Template Function
var template = function(id) {
  return _.template( $('#' + id).html() );
}

// Models
var Book = Backbone.Model.extend({});

// Collections
var Books = Backbone.Collection.extend({
  model: Book,
  comparator: 'title',
  localStorage: new Backbone.LocalStorage("BookCollection")
});

// Views - Form Actions
var AddBookView = Backbone.View.extend({
  el: '#addBook',
  events: {
    'submit': 'addBook'
  },
  addBook: function(e) {
    e.preventDefault();
    
    this.collection.create({
      title: this.$('#book_title').val(),
      author: this.$('#book_author').val(),
      year: this.$('#book_year').val()
    }, { wait: true });
    
    this.clearForm();
  },
  clearForm: function() {
    this.$('#book_title').val(''),
    this.$('#book_author').val(''),
    this.$('#book_year').val('')
  }
});

// Views - Books
var BooksView = Backbone.View.extend({
  tagName: 'tbody',
  initialize: function() {
    this.collection.on('add', this.addOne, this);
  },
  render: function() {
    this.collection.each(this.addOne, this);
    return this;
  },
  addOne: function(book) {
    var bookView = new BookView({ model: book });
    this.$el.append(bookView.render().el);
  }
});

var BookView = Backbone.View.extend({
  tagName: 'tr',
  template: template('bookTemplate'),
  initialize: function() {
    // Leaky method?:
    // this.model.on('destroy', this.unrender, this);
    
    // New method:
    this.listenTo(this.model, 'destroy', this.remove);
  },
  render: function() {
    this.$el.html( this.template( this.model.toJSON() ));
    console.log(this.model.toJSON());
    return this;
  },
  events: {
    'click a.edit': 'editContact',
    'click a.delete': 'deleteContact'
  },
  editContact: function() {
    console.log(this.model.toJSON());
  },
  deleteContact: function() {
    this.model.destroy();
  }
});



// create an instance of the model
var books = new Books();

// sampe data
books.add({ title: "The Whistler", author: "John Grisham", year: 2017 });
books.add({ title: "The Wrong Side of Goodbye", author: "Michael Connelly", year: 2017 });
books.add({ title: "The New Cool", author: "Neal Bascomb", year: 2011 });
books.add({ title: "Harry Potter and the Philosopher's Stone", author: "J. K. Rowling", year: 1997 });
books.add({ title: "Harry Potter and the Chamber of Secrets", author: "J. K. Rowling", year: 1998 });
books.add({ title: "Kitchen Confidential", author: "Anthony Bourdain", year: 2008 });

// create a view instance of the collection
// create view after data to keep data sorted
var allBooksView = new BooksView({ collection: books }).render();
$('#allBooks').append(allBooksView.el);

var addBooksView = new AddBookView({ collection: books });

const search = query => {
    console.log(query);
    app.innerHTML = "";
    fetch("https://www.googleapis.com/books/v1/volumes?q=" + encodeURIComponent(query) + "&maxResults=40")
        .then(res => res.json())
        .then(res => res.items)
        .then(res => res.map(book => ({
            id: book.id,
            title: book.volumeInfo.title || "",
            authors: book.volumeInfo.authors || [],
            publisher: book.volumeInfo.publisher || "",
            publishedDate: book.volumeInfo.publishedDate || "",
            img: (book.volumeInfo.imageLinks || []).thumbnail,
            link: book.accessInfo.webReaderLink || ""
        })))
        .then(res => res.map(render))
        .catch(err => console.log(err));
}

const app = document.querySelector('#results');

const render = book => {
    const node = document.createElement('div');
    let img = (book.img !== undefined)
        ? `<img src="${book.img}" />`
        : ""
    node.innerHTML = `
        <a id="link-${book.id}" href="${book.link}">
            <h2>${book.title}</h2>
            <p>${book.authors.join(", ")}</p>
            ${img}
            <p>${book.publisher} (${book.publishedDate})</p>
        </a>`;
    node.setAttribute("class", "book");
    app.appendChild(node);
}

var bookSearchTerm,
bookImage,
bookTitle,
bookAuthor;
function googleBookSearch(searchVal){
	bookSearchTerm = searchVal;
    $.ajax({
        url: 'https://www.googleapis.com/books/v1/volumes?q=' + bookSearchTerm,
        success: function(results) {
            $('#results').empty().hide();
            $.each(results['items'], function(a, item) {
                bookImage = item['volumeInfo']['imageLinks'] && item['volumeInfo']['imageLinks']['thumbnail']  ? item['volumeInfo']['imageLinks']['thumbnail'] : 'http://fivebooks.com//app/uploads/2012/06/no_book_cover_4.jpg';
								bookTitle = item['volumeInfo']['title'] ? item['volumeInfo']['title'] : '';
								bookAuthor = item['volumeInfo']['authors'] ? 'by '+item['volumeInfo']['authors'] : '';
                $('#results').append('<li class="book clear">' +
                    '<div class="book-cover"><img src="' + bookImage + '" /></div>' +
                    '<div class="book-meta">' +
                    '<span class="book-title">' + bookTitle + '</span>' +
                    '<span class="book-author">' + bookAuthor.replace(/,/g, ", ") + '</span>' +
                    '</div>' +
                    '</li>');
            });
            $('#results').fadeIn();
        }
    });
}

$("button").click(function(e) {
    e.preventDefault();
    googleBookSearch($('#search').val());
});