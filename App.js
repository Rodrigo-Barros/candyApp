import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Button,
  TouchableOpacity,
  FlatList,
  TextInput,
  ToastAndroid,
  StatusBar,
} from 'react-native';

// Third Party Plugins
import {Picker} from '@react-native-picker/picker';
import QRCodeScanner from 'react-native-qrcode-scanner';
import {RNCamera} from 'react-native-camera';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import SQLite from 'react-native-sqlite-storage';
import RadioForm from 'react-native-simple-radio-button';

const Products = (props) => {
  const styles = {
    container: {
      flex: 1,
      backgroundColor: '#eae9ef',
      marginTop: 10,
    },
    productContainer: {
      backgroundColor: '#ffffff',
      width: '90%',
      left: '5%',
      marginBottom: 10,
      padding: 10,
    },
    productTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      textAlign: 'center',
      borderColor: 'grey',
      borderBottomWidth: 0.5,
    },
    actionButtons: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      marginLeft: 'auto',
    },
    btnEdit: {
      backgroundColor: 'blue',
      marginRight: 10,
      padding: 10,
      fontSize: 12,
      fontWeight: 'bold',
    },
    btnRemove: {
      backgroundColor: 'red',
      marginRight: 10,
      padding: 10,
    },
    textWhite: {
      color: '#fff',
    },
    btnAddProduct: {
      backgroundColor: 'blue',
      padding: 10,
      width: '30%',
      marginLeft: 'auto',
      marginRight: '5%',
      marginBottom: 15,
      borderRadius: 10,
    },
  };

  const {products, setProducts, navigation} = props;

  // load products only one time
  useEffect(() => {
    DB.getProducts((rows) => {
      rows.map((row) => {
        products.push({
          name: row.nome,
          price: row.preco,
          quantity: row.quantidade,
          codigo_de_barras: row.codigo_de_barras,
        });
      });
      // remove first element from array
      products.shift();
    });
  }, [products]);

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({item}) => (
          <View style={styles.productContainer}>
            <Text style={styles.productTitle}>{item.name}</Text>
            <Text>Preço: {item.price}</Text>
            <Text>Quantidade: {item.quantity}</Text>
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.btnEdit}>
                <Text style={styles.textWhite}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnRemove}>
                <Text style={styles.textWhite}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
      <TouchableOpacity
        style={styles.btnAddProduct}
        onPress={() => navigation.navigate('Novo Produto')}>
        <Text style={styles.textWhite}>Novo Produto</Text>
      </TouchableOpacity>
    </View>
  );
};

// Here the user register new product
const NewProduct = (props) => {
  const styles = {
    container: {
      flex: 1,
      backgroundColor: '#eae9ef',
      paddingTop: 10,
    },
    label: {
      fontSize: 20,
      fontWeight: 'bold',
      width: '90%',
      marginLeft: '5%',
    },
    input: {
      width: '90%',
      marginLeft: '5%',
      fontSize: 20,
      borderBottomWidth: 0.3,
      borderColor: 'grey',
      marginBottom: 5,
    },
    btnAddNewProduct: {
      backgroundColor: 'blue',
      padding: 10,
      alignContent: 'flex-end',
      position: 'absolute',
      width: '100%',
      bottom: 10,
    },
    btnAddNewProductText: {
      color: '#fff',
      textAlign: 'center',
      fontSize: 15,
      fontWeight: 'bold',
    },
  };

  const [name, setName] = useState('');
  const [barcode, setBarcode] = useState('');
  const [amount, setAmount] = useState(0);
  const [price, setPrice] = useState(0);
  const {products, setProducts, navigation} = props;

  const insertNewProduct = (name, barcode, amount, price) => {
    const db = DB.db;

    db.transaction((tx) => {
      tx.executeSql(
        `-- DELETE FROM produtos;
        INSERT INTO produtos (nome,preco,codigo_de_barras,quantidade) 
        VALUES("${name}",${price},${barcode},${amount})`,
        [],
        (tx, results) => {
          products.push({
            name,
            price,
            quantity: amount,
          });
          navigation.navigate('Produtos');
        },
        (error) => console.log('Error: ', error),
      );
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Novo Produto:</Text>
      <TextInput
        style={styles.input}
        onChangeText={(value) => setName(value)}
        placeholder="Digite o nome do produto"
      />

      <Text style={styles.label}>Código de barras:</Text>
      <TextInput
        style={styles.input}
        onChangeText={(value) => setBarcode(parseInt(value))}
        placeholder="Digite o Código de Barras"
        keyboardType="numeric"
      />

      <Text style={styles.label}>Preço:</Text>
      <TextInput
        style={styles.input}
        onChangeText={(value) => setPrice(parseFloat(value))}
        placeholder="Digite o preço do produto"
        keyboardType="numeric"
      />

      <Text style={styles.label}>Quantidade:</Text>
      <TextInput
        style={styles.input}
        onChangeText={(value) => setAmount(parseInt(value))}
        placeholder="Digite a quantidade de produtos"
        keyboardType="numeric"
      />

      <TouchableOpacity style={{backgroundColor: 'red'}}>
        <Text style={styles.btnAddNewProductText}>
          Escanear Código de barras
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.btnAddNewProduct}
        onPress={() => insertNewProduct(name, barcode, amount, price)}>
        <Text style={styles.btnAddNewProductText}>Cadastrar</Text>
      </TouchableOpacity>
    </View>
  );
};

const Clients = (props) => {
  const styles = {
    container: {
      flex: 1,
      backgroundColor: '#eae9ef',
      marginTop: 10,
    },
    userContainer: {
      backgroundColor: '#ffffff',
      width: '90%',
      left: '5%',
      marginBottom: 10,
      padding: 10,
    },
    userName: {
      fontSize: 20,
      fontWeight: 'bold',
      textAlign: 'center',
      borderColor: 'grey',
      borderBottomWidth: 0.5,
    },
    actionButtons: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      marginLeft: 'auto',
    },
    btnEdit: {
      backgroundColor: 'blue',
      marginRight: 10,
      padding: 10,
      fontSize: 12,
      fontWeight: 'bold',
    },
    btnRemove: {
      backgroundColor: 'red',
      marginRight: 10,
      padding: 10,
    },
    textWhite: {
      color: '#fff',
    },
    btnAddProduct: {
      backgroundColor: 'blue',
      padding: 10,
      width: '30%',
      marginLeft: 'auto',
      marginRight: '5%',
      marginBottom: 15,
      borderRadius: 10,
    },
  };
  const {navigation, clients, setClients} = props;
  // only will update the component when the value
  // clients is changed
  useEffect(() => {
    DB.getClients((rows) => {
      rows.map((row) => {
        clients.push({
          name: row.nome,
        });
      });
    });
    clients.shift();
  }, [clients]);

  return (
    <View style={styles.container}>
      <FlatList
        data={clients}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({item}) => (
          <TouchableOpacity style={styles.userContainer}>
            <Text style={styles.userName}>{item.name}</Text>
            <Text>Devendo: R$ {item.deve}</Text>
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.btnEdit}>
                <Text style={styles.textWhite}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnRemove}>
                <Text style={styles.textWhite}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity
        style={styles.btnAddProduct}
        onPress={() => navigation.navigate('Novo Cliente')}>
        <Text style={styles.textWhite}>Novo Cliente</Text>
      </TouchableOpacity>
    </View>
  );
};

const NewClient = (props) => {
  const styles = {
    container: {
      flex: 1,
      backgroundColor: '#eae9ef',
      paddingTop: 10,
    },
    label: {
      fontSize: 20,
      fontWeight: 'bold',
      width: '90%',
      marginLeft: '5%',
    },
    input: {
      width: '90%',
      marginLeft: '5%',
      fontSize: 20,
    },
    btnAddNewClient: {
      backgroundColor: 'blue',
      padding: 10,
      alignContent: 'flex-end',
      position: 'absolute',
      width: '100%',
      bottom: 10,
    },
    btnAddNewClientText: {
      color: '#fff',
      textAlign: 'center',
      fontSize: 15,
      fontWeight: 'bold',
    },
  };
  const {navigation, clients} = props;
  const [clientName, setClientName] = useState('');
  const insertNewClient = () => {
    const db = DB.db;
    db.transaction((tx) => {
      tx.executeSql(
        `INSERT INTO usuarios (nome) VALUES ("${clientName}")`,
        [],
        (_, results) => {
          console.log(`Usuário ${clientName} inserido com sucesso`);
          clients.push({name: clientName});
          navigation.navigate('Clientes');
        },
        (error) => console.log('erro ao inserir o usuário ', error),
      );
    });
  };
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Novo Cliente:</Text>
      <TextInput
        style={styles.input}
        onChangeText={(value) => setClientName(value)}
        placeholder="Digite o nome do cliente"
      />
      <TouchableOpacity
        style={styles.btnAddNewClient}
        onPress={insertNewClient}>
        <Text style={styles.btnAddNewClientText}>Cadastrar</Text>
      </TouchableOpacity>
    </View>
  );
};

const ProductSell = ({navigation}) => {
  const styles = {
    container: {
      flex: 1,
      paddingTop: 10,
    },
    inputLabel: {
      fontSize: 20,
      fontWeight: 'bold',
      marginLeft: '5%',
    },
    picker: {
      width: '65%',
      marginTop: -10,
    },
    btnScan: {
      width: '90%',
      backgroundColor: 'green',
      marginBottom: 10,
      padding: 5,
      marginLeft: '5%',
    },
    btnScanText: {
      fontSize: 15,
      fontWeight: 'bold',
      color: '#fff',
      textAlign: 'center',
    },
    btnFinish: {
      backgroundColor: 'blue',
      padding: 5,
      width: '48%',
    },
    btnFinishText: {
      color: '#fff',
      fontSize: 15,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    radioForm: {
      marginTop: 5,
      marginLeft: '5%',
    },
    wrapperInput: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    wrapperRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginLeft: '5%',
      marginRight: '5%',
    },
    orderDetails: {
      title: {
        fontSize: 14,
        marginLeft: '5%',
      },
      head: {
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: '5%',
      },
      body: {
        fontSize: 14,
        marginLeft: '5%',
      },
    },
  };

  const [clientRows, setClientsRows] = useState([]);
  const [productRows, setProductRows] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [paymentType, setPaymentType] = useState('fiado');
  const [disableAddButton, setDisableAddButton] = useState(false);
  const [total, setTotal] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState(0);

  const [orderInfo, setOrderInfo] = useState({});

  const selectClientsList = async () => {
    return new Promise((resolve, reject) => {
      const db = DB.db;
      db.transaction((tx) => {
        tx.executeSql(
          'SELECT * FROM usuarios',
          [],
          (_, results) => {
            let rows = results.rows.raw();
            rows.unshift({id: 0, nome: 'Selecione'});
            resolve(rows);
          },
          (error) => {
            console.log('Houve um erro ao selecionar a tabela\n', error);
          },
        );
      });
    }).then((rows) => {
      //console.log(rows);
      setClientsRows(rows);
    });
  };

  const selectProductsList = async () => {
    return new Promise((resolve, reject) => {
      const db = DB.db;
      db.transaction((tx) => {
        tx.executeSql(
          'SELECT * FROM produtos',
          [],
          (_, results) => {
            let rows = results.rows.raw();
            rows.unshift({id: 0, nome: 'Selecione'});
            resolve(rows);
          },
          (error) => {
            console.log('Houve um erro ao selecionar a tabela\n', error);
          },
        );
      });
    }).then((rows) => {
      //console.log(rows);
      setProductRows(rows);
    });
  };

  useEffect(() => {
    let isMounted = false;
    selectProductsList();
    selectClientsList();
    return () => {
      isMounted = true;
    };
  }, [clientRows, productRows]);
  //console.log('pr', productRows);

  // const products = [
  //   {name: 'Neugebauer Cookies'},
  //   {name: 'Neugebauer Branco'},
  //   {name: 'Neugebauer Meio Amargo'},
  // ];

  // let productRows = [<Picker.Item value="selecione" label="Selecione" />];
  // products.forEach((item, index) => {
  //   productRows.push(
  //     <Picker.Item value={item.name} label={item.name} key={index} />,
  //   );
  // });

  let productAmount = [<Picker.Item value="selecione" label="Selecione" />];
  for (let i = 1; i < 11; i++) {
    productAmount.push(<Picker.Item value={i} label={i.toString()} />);
  }

  return (
    <View style={styles.container}>
      {/* Clients*/}
      <View style={styles.wrapperInput}>
        <Text style={styles.inputLabel}>Cliente:</Text>
        <Picker
          style={styles.picker}
          onValueChange={(value) => {
            let client = clientRows[value];
            orderInfo.cliente = {
              nome: client.nome,
              id: client.id,
            };
            setOrderInfo(orderInfo);
          }}
          selectedValue={0}>
          {clientRows.map((client, index) => (
            <Picker.Item
              label={client.nome}
              value={client.id}
              key={client.id}
            />
          ))}
        </Picker>
      </View>
      {/*Products*/}
      <View style={styles.wrapperInput}>
        <Text style={styles.inputLabel}>Produto:</Text>
        <Picker
          style={styles.picker}
          selectedValue={selectedProduct}
          onValueChange={(value, index) => {
            let product = productRows[index];
            let amount = orderInfo.hasOwnProperty('produto')
              ? orderInfo.produto.quantidade
              : 0;
            orderInfo.produto = {
              nome: product.nome,
              codigo_de_barras: value,
              preco: product.preco,
              estoque: product.quantidade,
              quantidade: amount,
            };
            setOrderInfo(orderInfo);
          }}>
          {productRows.map((product) => (
            <Picker.Item
              value={product.codigo_de_barras}
              label={product.nome}
              key={product.id}
            />
          ))}
        </Picker>
      </View>
      {/* Quantidade */}
      <View style={styles.wrapperInput}>
        <Text style={styles.inputLabel}>Quantidade:</Text>
        <Picker
          style={styles.picker}
          onValueChange={(value) => {
            let amount = value;
            let product = orderInfo.produto;
            orderInfo.produto.quantidade = amount;
            if (amount > product.estoque) {
              console.log(
                'você possui apenas ' +
                  product.estoque +
                  ' produtos em seu estoque',
              );

              ToastAndroid.show(
                'Você possui apenas ' + product.estoque + ' em seu estoque',
                ToastAndroid.LONG,
              );

              setDisableAddButton(true);
            } else {
              setDisableAddButton(false);
            }
          }}>
          {productAmount}
        </Picker>
      </View>
      {/*Payment Type*/}
      <Text style={styles.inputLabel}>Tipo de pagamento:</Text>
      <RadioForm
        style={styles.radioForm}
        radio_props={[
          {label: 'á receber  ', value: 'NAO PROCESSADO'},
          {label: 'recebido', value: 'PROCESSADO'},
        ]}
        formHorizontal={true}
        onPress={(value) => {
          setPaymentType(value);
        }}
      />
      <TouchableOpacity
        style={styles.btnScan}
        onPress={() => {
          navigation.navigate('Escanear');
        }}>
        <Text style={styles.btnScanText}>Ler Códigos de Barras</Text>
      </TouchableOpacity>

      {/*Adicionar*/}
      <View style={styles.wrapperRow}>
        <TouchableOpacity
          style={styles.btnFinish}
          disabled={disableAddButton}
          onPress={() => {
            let subtotal =
              orderInfo.produto.quantidade * orderInfo.produto.preco;
            orderInfo.subtotal = subtotal;
            orderItems.push({
              nome: orderInfo.produto.nome,
              quantidade: orderInfo.produto.quantidade,
              codigo_de_barras: orderInfo.produto.codigo_de_barras,
              preco: orderInfo.produto.preco,
              subtotal,
            });
            setTotal(0);
            let local_total = 0;
            orderItems.map((item) => {
              local_total = local_total + item.subtotal;
            });
            setTotal(local_total);
            console.log('total', total);
            console.log('orderInfo', orderInfo);
            console.log('orderItems', orderItems);
            setOrderItems(orderItems);
          }}>
          <Text style={styles.btnFinishText}>Adicionar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnFinish} onPress={newSell}>
          <Text style={styles.btnFinishText}>Vender</Text>
        </TouchableOpacity>
      </View>
      {/* Render cart items */}
      {orderItems.length > 0 ? (
        <View>
          <Text style={styles.orderDetails.title}>Detalhes do pedido:</Text>
          <Text style={styles.orderDetails.head}>Qnt Produto Un Subtotal</Text>
        </View>
      ) : (
        <Text></Text>
      )}
      {orderItems.map((item) => (
        <Text style={styles.orderDetails.body}>
          {item.quantidade} {item.nome} {item.subtotal / item.quantidade}{' '}
          {item.subtotal}
        </Text>
      ))}
      {orderItems.length > 0 ? (
        <Text style={styles.orderDetails.head}>Total: R$ {total}</Text>
      ) : (
        <Text></Text>
      )}
    </View>
  );
};

const NewScan = () => {
  // const [count, setCount] = useState(0);
  const [barcode, setBarcode] = useState('Escaneie um produto');
  return (
    <QRCodeScanner
      onRead={(e) => {
        console.log(e.data);
        if (e.data === '7891330017256') {
          var produto = 'Neugebauer Amendoim';
        } else if (e.data === '7896058516104') {
          var produto = 'Bala de Goma';
        }
        setBarcode(produto);

        //reativa o scanner
        QRCodeScanner.scanner.reactivate();
      }}
      // this allow scanner being reactivate programmatically
      ref={(node) => {
        QRCodeScanner.scanner = node;
      }}
      flashMode={RNCamera.Constants.FlashMode.auto}
      topContent={
        <TouchableOpacity>
          <Text style={{marginBottom: 30}}>{barcode}</Text>
        </TouchableOpacity>
      }
    />
  );
};

class DB {
  static db = SQLite.openDatabase(
    'candy.db',
    '1,0',
    'candy',
    20000,
    () => console.log('banco de dados aberto'),
    (error) => console.log('error', error),
  );

  static initializeDB() {
    // usuarios
    this.db.executeSql(
      `
        CREATE TABLE IF NOT EXISTS usuarios(
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nome TEXT,
          celular TEXT
        )
      `,
      [],
      () => console.log('Tabela usuarios criada com sucesso'),
      (error) => console.log('Erro ao criar tabela usuarios: ', error),
    );
    // produtos
    this.db.executeSql(
      `
        CREATE TABLE IF NOT EXISTS produtos(
          codigo_de_barras INTEGER PRIMARY KEY,
          nome TEXT,
          preco REAL,
          quantidade INTEGER DEFAULT 0
        )
      `,
      [],
      () => console.log('Tabela produtos criada com sucesso'),
      (error) => console.log('Erro ao criar tabela produtos: ', error),
    );
    // pedidos
    this.db.executeSql(
      `
        CREATE TABLE IF NOT EXISTS pedidos(
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          id_usuario INTEGER,
          data_pedido NUMERIC DEFAULT (date('now')),
          status TEXT DEFAULT 'NAO PROCESSADO',
          FOREIGN KEY(id_usuario) REFERENCES usuarios(id)
        );
      `,
      [],
      () => console.log('Tabela pedidos criada com sucesso'),
      (error) => console.log('Erro ao criar tabela pedidos: ', error),
    );
    this.db.executeSql(
      `
        CREATE TABLE IF NOT EXISTS pedido_itens(
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          id_pedido INTEGER,
          codigo_de_barras INTEGER,
          quantidade INTEGER,
          preco INTEGER,
          FOREIGN KEY (codigo_de_barras) REFERENCES produtos(codigo_de_barras),
          FOREIGN KEY (id_pedido) REFERENCES pedidos(id)
        );
      `,
      [],
      () => console.log('Tabela pedido_itens criada com sucesso'),
      (error) => console.log('Erro ao criar tabela pedido_itens: ', error),
    );
  }

  // initializeDB
  static populateDB() {
    this.db.executeSql(
      `
    -- INSERT INTO usuarios (nome,celular) VALUES('Rodrigo','11992798005');

    -- INSERT INTO produtos (nome,preco,quantidade,codigo_de_barras) VALUES('Neugebauer Amendoim',5.0,10,78900001923);
    INSERT INTO produtos (nome,preco,quantidade,codigo_de_barras) VALUES('Neugebauer Cookies',5.0,10,78900001924);
  

    -- INSERT INTO pedidos (id_usuario) VALUES(1);
    -- INSERT INTO pedido_itens (id_pedido,codigo_de_barras,quantidade,preco) VALUES(1,78900001923,2,5);
    -- UPDATE produtos SET quantidade=quantidade-1 WHERE codigo_de_barras=78900001923;
    `,
      [],
      () => console.log('dados inseridos com sucesso no banco'),
      (error) => console.log('Erro:', error),
    );
  }

  static getProducts(callback) {
    this.db.transaction((tx) => {
      tx.executeSql('SELECT * FROM produtos', [], (_, results) => {
        let rows = results.rows.raw();
        callback(rows);
      });
    });
  }

  static getClients(callback) {
    this.db.transaction((tx) => {
      tx.executeSql('SELECT * FROM usuarios', [], (_, results) => {
        let rows = results.rows.raw();
        callback(rows);
      });
    });
  }

  static selectClients(callback) {
    this.db.transaction((tx) => {
      tx.executeSql('SELECT * FROM usuarios', [], (_, results) => {
        const rows = results.rows.raw();
        callback(rows);
      });
    });
  }
}

const HomePage = ({navigation}) => {
  const styles = {
    container: {
      flex: 1,
      paddingTop: 10,
    },
    btn: {
      marginLeft: '5%',
      padding: 10,
      width: '90%',
      marginBottom: 10,
      backgroundColor: '#00F',
    },
    btnText: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#FFF',
    },
  };

  const ss = {
    container: {
      flex: 1,
    },
    wrapper: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginLeft: '5%',
      marginRight: '5%',
    },
    row: {
      height: 10,
      width: '20%',
      backgroundColor: 'blue',
    },
  };

  //return (
  //  <View style={ss.container}>
  //    <View style={ss.wrapper}>
  //      <View style={ss.row} />
  //      <View style={ss.row} />
  //    </View>
  //  </View>
  //);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.btn}>
        <Text style={styles.btnText}>Filtrar</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.btn}
        onPress={() => navigation.navigate('Nova Venda')}>
        <Text style={styles.btnText}>Nova Venda</Text>
      </TouchableOpacity>
    </View>
  );
};

const App = () => {
  const Tab = createBottomTabNavigator();
  const Stack = createStackNavigator();
  const [products, setProducts] = useState([{}]);
  const [clients, setClients] = useState([{}]);

  const Tabs = () => {
    return (
      <Tab.Navigator>
        <Tab.Screen name="Inicio" component={HomePage} />
        <Tab.Screen name="Clientes">
          {(props) => (
            <Clients {...props} clients={clients} setClients={setClients} />
          )}
        </Tab.Screen>
        <Tab.Screen name="Produtos">
          {(props) => (
            <Products
              {...props}
              products={products}
              setProducts={setProducts}
            />
          )}
        </Tab.Screen>
      </Tab.Navigator>
    );
  };
  return (
    <NavigationContainer>
      <Stack.Navigator /*headerMode="none" */>
        <Stack.Screen name="Tabs" component={Tabs} />
        <Stack.Screen name="Novo Produto">
          {(props) => <NewProduct {...props} products={products} />}
        </Stack.Screen>
        <Stack.Screen name="Novo Cliente">
          {(props) => <NewClient {...props} clients={clients} />}
        </Stack.Screen>
        <Stack.Screen name="Nova Venda" component={ProductSell} />
        <Stack.Screen name="Escanear" component={NewScan} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
