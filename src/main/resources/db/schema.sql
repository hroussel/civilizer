DROP TABLE IF EXISTS GLOBAL_SETTING;
DROP TABLE IF EXISTS FRAGMENT;
DROP TABLE IF EXISTS TAG;
DROP TABLE IF EXISTS FILE;
DROP TABLE IF EXISTS TAG2TAG;
DROP TABLE IF EXISTS TAG2FRAGMENT;
DROP TABLE IF EXISTS FRAGMENT2FRAGMENT;

CREATE TABLE GLOBAL_SETTING(
      SETTING_NAME VARCHAR(100) NOT NULL
    , SETTING_VALUE VARCHAR
    , PRIMARY KEY (SETTING_NAME)
);

CREATE TABLE FRAGMENT(
      FRAGMENT_ID BIGINT NOT NULL AUTO_INCREMENT
    , TITLE VARCHAR(200)
    , CONTENT VARCHAR
    , CREATION_DATETIME TIMESTAMP NOT NULL
    , UPDATE_DATETIME TIMESTAMP NOT NULL

    , PRIMARY KEY (FRAGMENT_ID)
);

CREATE TABLE TAG(
      TAG_ID BIGINT NOT NULL AUTO_INCREMENT
    , TAG_NAME VARCHAR(100) NOT NULL

    , PRIMARY KEY(TAG_ID)
    , UNIQUE (TAG_NAME)
);

CREATE TABLE FILE(
      FILE_ID BIGINT NOT NULL AUTO_INCREMENT
    , FILE_NAME VARCHAR(100) NOT NULL

    , PRIMARY KEY(FILE_ID)
    , UNIQUE (FILE_NAME)
);

CREATE TABLE TAG2TAG(
      TAG2TAG_ID BIGINT IDENTITY NOT NULL
    , PARENT_ID BIGINT NOT NULL
    , CHILD_ID BIGINT NOT NULL

    , PRIMARY KEY(TAG2TAG_ID)
    , UNIQUE (PARENT_ID, CHILD_ID)
    , FOREIGN KEY (PARENT_ID) REFERENCES TAG (TAG_ID) ON DELETE CASCADE
    , FOREIGN KEY (CHILD_ID) REFERENCES TAG (TAG_ID) ON DELETE CASCADE
);

CREATE TABLE TAG2FRAGMENT(
      TAG2FRAGMENT_ID BIGINT IDENTITY NOT NULL
    , TAG_ID BIGINT NOT NULL
    , FRAGMENT_ID BIGINT NOT NULL

    , PRIMARY KEY(TAG2FRAGMENT_ID)
    , UNIQUE (TAG_ID, FRAGMENT_ID)
    , FOREIGN KEY (TAG_ID) REFERENCES TAG (TAG_ID) ON DELETE CASCADE
    , FOREIGN KEY (FRAGMENT_ID) REFERENCES FRAGMENT (FRAGMENT_ID) ON DELETE CASCADE
);

CREATE TABLE FRAGMENT2FRAGMENT(
      FRAGMENT2FRAGMENT_ID BIGINT IDENTITY NOT NULL
    , FROM_ID BIGINT NOT NULL
    , TO_ID BIGINT NOT NULL

    , PRIMARY KEY(FRAGMENT2FRAGMENT_ID)
    , UNIQUE (FROM_ID, TO_ID)
    , FOREIGN KEY (FROM_ID) REFERENCES FRAGMENT (FRAGMENT_ID) ON DELETE CASCADE
    , FOREIGN KEY (TO_ID) REFERENCES FRAGMENT (FRAGMENT_ID) ON DELETE CASCADE
);


