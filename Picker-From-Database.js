import React, {useState} from 'react';
import {View, Text, Picker} from 'react-native';
import SQLite from 'react-native-sqlite-storage';

const elements = [{name: 'Rodrigo'}, {name: 'Edilson'}, {name: 'Enilda'}];

const App = () => {
  const [users, setUsers] = useState([
    <Picker.Item value="selecione" name="Selecione" />,
  ]);

  const successCB = async () => {
    return new Promise((resolve) => {
      db.transaction((tx) => {
        tx.executeSql('SELECT * FROM usuarios', [], (_, results) => {
          let rows = results.rows.raw();
          let clients = [];
          rows.map((client) => {
            clients.push({name: client.nome});
          });
          resolve(clients);
        });
      });
    }).then((rows) => {
      rows.unshift({name: 'Selecione'});
      console.log(rows);
      setUsers(rows);
    });
  };

  const errorCB = (error) => {
    console.log(error);
  };

  const db = SQLite.openDatabase(
    'candy.db',
    '1.0',
    'candy',
    20000,
    successCB.bind(this),
    errorCB,
  );

  return (
    <View>
      <Picker>
        {users.map((user, index) => (
          <Picker.Item label={user.name} value={user.name} key={index} />
        ))}
      </Picker>
    </View>
  );

  return (
    <View>
      {users.map((user) => (
        <Text>{user.name}</Text>
      ))}
    </View>
  );
};

export default App;
