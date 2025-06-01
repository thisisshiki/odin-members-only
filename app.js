const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
const passport = require('passport');
const session = require('express-session');
const bodyParser = require('body-parser');
const db = require('./db/db');
const PORT = process.env.PORT || 3000;

