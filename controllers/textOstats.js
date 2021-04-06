'use strict';

const mathjs = require('mathjs');

// to do: Offer option for omitting conjuctionss / prepositions etc.
const omitWordsDefault = ["a", "an", "the"];
const MAX_DISP_WORDS = 3;

const MAX_SKIP_OMIT_WORDS = 50

/** 
 * Helper function for populating response object and logging errors to the console.
 */
const resStatus = (res, code, success, message, console_msg) => {
  if (console_msg)
    console.log(console_msg);
  res.status(code).send({
    success,
    message
  });
  return;
}


/** 
 * Get and validate request parameters.
 *
 *   @param {object}  pdata - the request object that contains the params.
 *   @param {res}
 *   @return {array}
 *
 */
const getParams = (pdata) => {
  let err = null;
  let data = {};

  data["text"] = pdata.text;
  if (!(data["text"])) {
    err = "Parameter 'text' is required.";
    return [null, err];
  }

  data["extended"] = pdata.metrics; // A noop for now. Will be utlized in future commits
  if (data["extended"] &&
    (typeof(data["extended"]) !== 'boolean')) {
    err = "Parameter 'extended' must be either true or false.";
    return [null, err];
  }

  data["omitWords"] = pdata.omitWords;
  if (data["omitWords"]) {
    if (!Array.isArray(data["omitWords"])) // to do: check for strings in array
    {
      err = "Parameter 'omitWords' must be an array of strings.";
      return [null, err];
    }
  } 
  else
    data["omitWords"] = omitWordsDefault;

  data["maxDispWords"] = pdata.maxDispWords;
  if (data["maxDispWords"] &&
    ((isNaN(data["maxDispWords"])) ||
      (data["maxDispWords"] < 1) || (data["maxDispWords"] > MAX_SKIP_OMIT_WORDS))) {
    err = "Parameter 'maxDispWords' must be a positive number between 1 and 50.";
    return [null, err];
  }

  data["skipFirst"] = pdata.skipFirst;
  if (data["skipFirst"] &&
    ((isNaN(data["skipFirst"])) ||
      (data["skipFirst"] < 1) || (data["skipFirst"] > MAX_SKIP_OMIT_WORDS))) {
    err = "Parameter 'skipFirst' must be a positive number between 1 and 50.";
    return [null, err];
  }

  return [data, null]
}



const wordSort = (a, b) => {
  return (a.length - b.length);
}

const wordSortDesc = (a, b) => {
  return (b.length - a.length);
}


// 
/** 
 * Find all words in a sentence. wordMap gets modified.
 *
 *   @param {string} sentence
 *   @param {object} wordMap
 *   @returns {string[]}
 */
const getWords = (text, wordMap = {}) => {

  let words = [];

  // unicode letter characters match as word characters
  let wordRe = /[\w\p{L}]+([-'\u2019][\w\p{L}]+)*/ug;

  let ans;
  while (ans = wordRe.exec(text)) {
    if (ans[0]) {
      let ansLower = ans[0].toLowerCase();
      if (wordMap[ansLower] === undefined)
        wordMap[ansLower] = 1;
      else
        wordMap[ansLower]++;
      words.push(ansLower);
    }
  }
  return words;
}

/** 
 * Get the most frequently used words in the text.
 *
 *   @param {object} inData
 *   @param {object} wordMap
 *   @param {number} maxlen
 *   @returns {string[]}
 */
const getMaxWordFreq = (inData, wordMap, maxlen) => {
  let maxq = [];

  const mapArrSort = (a, b) => {
    return (b[0] - a[0]);
  }

  let wordMapArr = [];

  for (let word in wordMap) {
    if (!inData["omitWords"].includes(word))
      wordMapArr.push([wordMap[word], word]);
  }

  wordMapArr.sort(mapArrSort);

  maxq = wordMapArr.slice(0, maxlen);

  return maxq;
}


/** 
 * Splits text into sentences.
 *
 *   @param {string} text
 *   @returns {string[]}
 */
const getSentences = (text) => {
  // at least one space is needed after the terminating punctuation for a sentence to be found.
  let sentRe = /([^.?!]+)([.!?]["]?(\s+|\s*$)|(\s*$))/g;
  // note:  ."\s+ ? at end, if any, are not saved and not needed.

  // As a convenience for the user, if the last sentence does not end in a period / ! / ? , 
  // it will still count as a sentence.

  // to do: skip \n\n w/o period (for example, a title line)

  let sent;
  let sentences = [];

  while (sent = sentRe.exec(text)) {
    sentences.push(sent[1]);
  }

  // to do: Mr. Dr., i.e.,  etc

  return sentences;
}

/** 
* Gets statistics about sentences: words (sorted and unsorted) per each sentence 
  and the std deviation of sentence lengths.
*
*   @param {object} inData
*   @param {string[]} words
*   @returns {number}
*/
const getSentenceData = (inData) => {

  let wordsPerSent = [];
  let sentenceData = {};

  if (inData.skipFirst) {
    // Skip inData.skipFirst lines. Most likely a title / author header.
    let newln_count = inData.skipFirst;
    while (newln_count) {
      let newlnOffs = inData.text.indexOf('\n');
      if (newlnOffs < 0)
        break;
      inData.text = inData.text.slice(newlnOffs + 1);
      newln_count--;
    }
  }

  let sentences = getSentences(inData.text);

  for (let sent of sentences) {
    let words = getWords(sent);
    wordsPerSent.push(words.length);
  }

  sentenceData.wordsPerSentUnsorted = [...wordsPerSent];
  wordsPerSent.sort((a, b) => a - b);
  sentenceData.wordsPerSent = wordsPerSent;

  if (sentences.length)
    sentenceData.stdDev = mathjs.std(sentenceData.wordsPerSent);
  else
    sentenceData.stdDev = 0;

  return [sentences, sentenceData];
}


/** 
 * Computes average word length, not counting words from the omit list.
 *
 *   @param {object} inData
 *   @param {string[]} words
 *   @returns {number}
 */
const getAvgWordLength = (inData, words) => {

  let totalLetters = 0;
  let totalWords = words.length;

  for (let word of words) {
    if (!inData["omitWords"].includes(word))
      totalLetters += word.length;
    else
      totalWords--; // remove this word from count
  }

  let avg = totalLetters / totalWords;
  return avg.toPrecision(4);
}

/** 
 * Calculates statistics about the text.
 *
 *   @param {object} inData
 *   @returns {object}
 */
const wordCalc = (inData) => {

  let [sentences, sentenceData] = getSentenceData(inData);
  let sentenceCount = 0;

  let allWords = [];
  let allWordMap = {};
  let words = [];
  let avgConseqSentLenDif = 0.0;

  for (let i = 0; i < sentences.length; i++) {
    words = getWords(sentences[i], allWordMap);
    allWords.push(...words);
  }

  let lenDif = 0;
  let lenDifArr = [];
  for (let i = 0; i < sentenceData.wordsPerSentUnsorted.length; i++) {
    if (i > 0) {
      lenDif = Math.abs(sentenceData.wordsPerSentUnsorted[i - 1] - sentenceData.wordsPerSentUnsorted[i]);
      lenDifArr.push(lenDif);
    }
  }

  if (lenDifArr.length)
    avgConseqSentLenDif = (lenDifArr.reduce((a, b) => a + b, 0) / lenDifArr.length).toPrecision(4);

  let dispMax = inData.maxDispWords ? inData.maxDispWords : MAX_DISP_WORDS;

  let maxWordFreq = getMaxWordFreq(inData, allWordMap, dispMax);
  for (let i = 0; i < maxWordFreq.length; i++) { // special check for 'I'
    if (maxWordFreq[i][1] === 'i') {
      maxWordFreq[i][1] = "I";
      break;
    }
  }

  let wordCount = allWords.length;
  let longestWordLen = 0;
  let allWordsSort = [];
  let longestWords = [];
  let avgWordsPerSentence = 0;
  let sentenceLenStdDev = 0.0;
  let avgWordLength = 0.0;

  if (wordCount) {
    allWordsSort = allWords.sort(wordSort);
    longestWords = Array.from(new Set(allWordsSort.slice(-dispMax)));
    longestWords.sort(wordSortDesc);
    longestWordLen = longestWords[0].length;
    avgWordsPerSentence = Math.round(wordCount / sentences.length);
    sentenceLenStdDev = sentenceData.stdDev.toPrecision(4);
    avgWordLength = getAvgWordLength(inData, allWords);
  }

  /* to do:
      # of hypnenated words
  	# of --
  	# of ? and !
  */

  sentenceCount = sentences.length;

  let success = true;

  let outData = {
    success,
    wordCount,
    sentenceCount,
    avgWordsPerSentence,
    sentenceLenStdDev,
    longestWords,
    longestWordLen,
    maxWordFreq,
    avgWordLength,
    avgConseqSentLenDif
  };
  return outData;
}


/**
 *   Endpoint for text-o-stat, the textual statistic generator. If successful, 
 *   responds with a JSON object containing statistics about the text.
 *
 *	@params {object} req
 *	@params {object} res
 *
 */
function textOstats(req, res) {
  let outData = {};

  let [inData, err] = getParams(req.body);
  if (!inData)
    return (resStatus(res, 400, false, `Bad parameters: ${err}`, err));

  outData = wordCalc(inData);
  if (outData)
    res.json(outData); // success
  else
    return (resStatus(res, 400, false, `No data returned.`));
}


module.exports = {
  textOstats
};
