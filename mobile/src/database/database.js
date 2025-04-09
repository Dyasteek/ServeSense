import SQLite from 'react-native-sqlite-storage';

const database_name = "ServeSense.db";
const database_version = "1.0";
const database_displayname = "ServeSense SQLite Database";
const database_size = 200000;

const db = SQLite.openDatabase(
  database_name,
  database_version,
  database_displayname,
  database_size,
  () => {
    console.log("Database opened successfully");
  },
  (error) => {
    console.error("Error opening database: ", error);
  }
);

export const initDatabase = () => {
  db.transaction((tx) => {
    // Tabla de equipos
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS teams (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        server_id TEXT,
        last_sync DATETIME
      )`,
      [],
      () => console.log("Teams table created successfully"),
      (error) => console.error("Error creating teams table: ", error)
    );

    // Tabla de jugadores
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS players (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        number INTEGER NOT NULL,
        position TEXT NOT NULL,
        team_id INTEGER,
        server_id TEXT,
        last_sync DATETIME,
        FOREIGN KEY (team_id) REFERENCES teams (id)
      )`,
      [],
      () => console.log("Players table created successfully"),
      (error) => console.error("Error creating players table: ", error)
    );

    // Tabla de partidos
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS matches (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date DATETIME NOT NULL,
        home_team_id INTEGER,
        away_team_id INTEGER,
        status TEXT DEFAULT 'scheduled',
        server_id TEXT,
        last_sync DATETIME,
        FOREIGN KEY (home_team_id) REFERENCES teams (id),
        FOREIGN KEY (away_team_id) REFERENCES teams (id)
      )`,
      [],
      () => console.log("Matches table created successfully"),
      (error) => console.error("Error creating matches table: ", error)
    );

    // Tabla de estadísticas
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS stats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        player_id INTEGER,
        match_id INTEGER,
        type TEXT NOT NULL,
        total INTEGER DEFAULT 0,
        successful INTEGER DEFAULT 0,
        errors INTEGER DEFAULT 0,
        points INTEGER DEFAULT 0,
        server_id TEXT,
        last_sync DATETIME,
        FOREIGN KEY (player_id) REFERENCES players (id),
        FOREIGN KEY (match_id) REFERENCES matches (id)
      )`,
      [],
      () => console.log("Stats table created successfully"),
      (error) => console.error("Error creating stats table: ", error)
    );
  });
};

export default db; 