/*
 * MIT License (MIT)
 * Copyright (c) 2018 Activeledger
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

const fs = require("fs");

 afterAll(() => {
  console.log("Cleaning up test files.");

  // Delete basic test file
  fs.unlink("./test-export.json", (err) => {
    if (err) {
      console.log(err);
    }
  });

  // Delete custom name file
  fs.unlink("./export-name-test.json", (err) => {
    if (err) {
      console.log(err);
    }
  });

  // Delete create dir test folders and file
  fs.unlink("./export/test/test-export.json", (err) => {
    if (err) {
      console.log(err);
    }

    fs.rmdir("./export/test", (err) => {
      if (err) {
        console.log(err);
      }

      fs.rmdir("./export", (err) => {
        if (err) {
          console.log(err);
        }
      });
    });
  });
 });