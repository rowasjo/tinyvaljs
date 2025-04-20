# tinyvaljs

Hash table service for storing and retrieving binary blobs using their SHA-256 hashes as keys.

Note: This project is primarily an experiment in using Node.js for HTTP service development.

## Development

### Install Dependencies

```
npm install
```

### Run

```
TINYVAL_DATA_DIR=.blobs node src/tinyvalapi/index.js
```

### Run Tests

```
node --test
```
