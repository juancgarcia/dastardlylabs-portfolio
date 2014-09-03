var Metalsmith  = require('metalsmith'),
    markdown    = require('metalsmith-markdown'),
    templates   = require('metalsmith-templates'),
    collections = require('metalsmith-collections'),
    permalinks  = require('metalsmith-permalinks'),
    branch  = require('metalsmith-branch'),
    Handlebars  = require('handlebars'),
    fs          = require('fs');


Handlebars.registerPartial('header', fs.readFileSync(__dirname + '/templates/partials/header.hbt').toString());
Handlebars.registerPartial('footer', fs.readFileSync(__dirname + '/templates/partials/footer.hbt').toString());


var ms = Metalsmith(__dirname);

ms
    .use(
        branch('content/*/*.md')
        .use(collections({
            projects: {
                pattern: 'content/projects/*.md'
            },
            pages: {
                pattern: 'content/pages/*.md'
            },
            posts: {
                pattern: 'content/posts/*.md',
                sortBy: 'date',
                reverse: true
            }
        }))
        .use(markdown())
        .use(permalinks({
            pattern: ':collection/:title'
        }))
        .use(templates('handlebars'))
        )
    .use(
        branch('index.md')
        .use(markdown())
        // .use(permalinks({
        //     pattern: ':collection/:title'
        // }))
        .use(templates('handlebars'))
        )
    ;

ms
    .destination('./build')
    .build()