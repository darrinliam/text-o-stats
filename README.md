# text-o-stats

text-o-stats computes statistics about a given body of text via a RESTful API to a Node / Express server. The caller provides the text in the body of a POST request. The response contains the following data:

* word count
* sentence count
* average words per sentence
* standard deviation of the sentence lengths
  * a measure of variation in sentence length over the entire body of text. Generally, more variety is better. But there are always exceptions.
* longest words
* longest word length
* most frequently used words
* average word length
* average consecutive difference of sentence length
  * a measure of variation in back-to-back sentence length. A body of text that has a lot of variety in back-to-back sentence length tends to flow more easily than a body of text that contains sentences of roughly the same length. Generally, more variety is better. Again, there are always exceptions.

The intention of this project is not to quantify the craft of writing. The data supplied is meant to offer writers some insight that may assist them in sharpening their craft.

Not all types of lexical constructs are supported at this time. Known issues: text containing words with dots, such as Mr., Mrs,. and i.e. They will be handled in a future commit.

The input text is expected to be prose. Poetry is not supported.

## Installation

Clone the repository or download the zip and expand in an empty directory, then in the directory containg package.json, run:

`npm install`

## Usage

Start the server with:

`npm start`

Send your request in the body of a POST request via curl or postman. For a sample call, `cd` to the `./examples` directory and run the following `curl` command:

`curl --request POST -H "Content-Type: application/json" --data @poker.json http://localhost:3001/api/v1/textostats`



## Request Options

The API currently supports one endpoint, `/api/v1/textostats` .

The request is a JSON object whose only required key is `"text"`. Example:

`{ "text" : "This is a sample text. It contains two sentences."}`

Currently supported options:

`"skipFirst" : <number> `          
  * Skips the first <number> lines of the text. Use this option when your text has a title/author header.

   
`"omitWords": ["omitword1", "omitword2", ...]`
  * Supplies list of words to omit when calculating the most frequently used words and average word length. The default is ["a", "an", "the"].

`"maxDispWords": <number>`

  * Indicates the maximum number of words to return for the longest words array and most frequently used words array. The default is 3.



## Response Object

Structure of a successful response:
```
{
  "success": true,
  "wordCount": <number>,
  "sentenceCount": <number>,
  "avgWordsPerSentence": <number>,
  "sentenceLenStdDev": <string>,
  "longestWords": [
    <string>,
    ...
  ],
  "longestWordLen": <number>,
  "maxWordFreq": [
    [
      <number>,
      <string>
    ],
    ...
  ],
  "avgWordLength": <string>,
  "avgConseqSentLenDif": <string>
}
```

## Server options

To change the port, run `npm start  --port <myport#>` 

To log the number of active connections every second, run `npm start  --verbose` 

To shut down the server, type `Ctrl-C`.











