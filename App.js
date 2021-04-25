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
import CheckBox from '@react-native-community/checkbox';
import { WebView } from 'react-native-webview';

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

  //const {products, setProducts, navigation} = props;
  //const {products, navigation, setProducts} = {...props};

  // funcional
  const {navigation} = props;
  const [products, setProducts] = useState({...props.products});
  const deleteProduct = (id) => {
    db.transaction((tx) => {
      tx.executeSql(
        'DELETE FROM produtos WHERE codigo_de_barras=?',
        [id],
        () => {
          products.map((product,index)=>{
            if (product.codigo_de_barras == id) {
              products.splice(index,1)
              let temp = [];
              products.map((product)=>{
                temp.push(product);
              });
              setProducts(temp);
            }   
          })
        },
        (error) => {
          console.log(error);
        },
      );
    });
  };

  const editProduct = (codigo_de_barras) => {
    let product = {};
    products.map((item) => {
      if (item.codigo_de_barras == codigo_de_barras) product = item;
      navigation.navigate('Novo Produto', {product});
    });
  };

  // load products only when props.products changes
  useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql('SELECT * FROM produtos ORDER BY nome', [], (_, results) => {
        let rows = results.rows.raw();
        let temp = [];
        rows.map((row) => {
          temp.push({
            name: row.nome,
            price: row.preco,
            quantity: row.quantidade,
            codigo_de_barras: row.codigo_de_barras,
          });
        });
        setProducts(temp);
        //console.log(rows);
      });
    });
  }, [props.products]);

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
              <TouchableOpacity
                style={styles.btnEdit}
                onPress={() => {
                  editProduct(item.codigo_de_barras);
                }}>
                <Text style={styles.textWhite}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.btnRemove}
                onPress={() => {
                  deleteProduct(item.codigo_de_barras);
                }}>
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
const NewProduct = ({products, setProducts, navigation, route}) => {
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

  const product =
    typeof route.params == 'undefined' ? {} : route.params.product;
  const mode = typeof route.params == 'undefined' ? 'create' : 'update';

  const [name, setName] = useState(
    product.hasOwnProperty('name') ? product.name : '',
  );
  const [barcode, setBarcode] = useState(
    product.hasOwnProperty('codigo_de_barras') ? product.codigo_de_barras : '',
  );
  const [amount, setAmount] = useState(
    product.hasOwnProperty('quantity') ? product.quantity : 0,
  );
  const [price, setPrice] = useState(
    product.hasOwnProperty('price') ? product.price : 0,
  );

  const insertNewProduct = () => {
    db.transaction((tx) => {
      tx.executeSql(
        `
        INSERT INTO produtos (nome,preco,codigo_de_barras,quantidade) 
        VALUES(?,?,?,?)`,
        [name, price, barcode, amount],
        () => {
          setProducts([...products,{
            name, price, 
            codigo_de_barras: barcode, quantity: amount
          }]);
          navigation.navigate('Produtos');
        },
        (error) => console.log('Error: ', error, barcode),
      );
    });
  };

  const updateProduct = () => {
    db.transaction((tx) => {
      tx.executeSql(
        `
        UPDATE produtos 
          SET nome=?,preco=?,quantidade=?
        WHERE codigo_de_barras=?
        `,
        [name, price, amount, barcode],
        () => {
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

  const chooseMode = () => {
    switch (mode) {
      case 'create':
        insertNewProduct();
        break;
      case 'update':
        updateProduct();
        break;
      default:
        throw new Error(
          'Expected values to function ',
          this.name,
          "do not match valid values 'create' or update 'value' received: ",
          mode,
        );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Novo Produto:</Text>
      <TextInput
        style={styles.input}
        onChangeText={(value) => setName(value)}
        placeholder="Digite o nome do produto"
        defaultValue={typeof product.name == 'undefined' ? '' : product.name}
      />

      <Text style={styles.label}>Código de barras:</Text>
      <TextInput
        style={styles.input}
        onChangeText={(value) => setBarcode(parseInt(value))}
        placeholder="Digite o Código de Barras"
        keyboardType="numeric"
        defaultValue={
          typeof product.codigo_de_barras == 'undefined'
            ? ''
            : product.codigo_de_barras.toString()
        }
      />

      <Text style={styles.label}>Preço:</Text>
      <TextInput
        style={styles.input}
        onChangeText={(value) => setPrice(parseFloat(value))}
        placeholder="Digite o preço do produto"
        keyboardType="numeric"
        defaultValue={
          typeof product.price == 'undefined' ? '' : product.price.toString()
        }
      />

      <Text style={styles.label}>Quantidade:</Text>
      <TextInput
        style={styles.input}
        onChangeText={(value) => setAmount(parseInt(value))}
        placeholder="Digite a quantidade de produtos"
        keyboardType="numeric"
        defaultValue={
          typeof product.quantity == 'undefined'
            ? ''
            : product.quantity.toString()
        }
      />

      <TouchableOpacity
        style={{backgroundColor: 'green', paddingTop: 5, paddingBottom: 5}}>
        <Text
          style={styles.btnAddNewProductText}
          onPress={() => {
            navigation.navigate('Escanear');
          }}>
          Escanear Código de barras
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btnAddNewProduct} onPress={chooseMode}>
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

  const {navigation} = props;
  const [clients, setClients] = useState({...props.clients});
  const deleteClient = (id) => {
    db.transaction(tx=>{
      tx.executeSql("DELETE FROM usuarios WHERE id=?",[id],()=>{
        // exclusão do usuario da interface
        console.log('Usuário com id ' + id + ' foi excluído com sucesso do banco de dados');
        clients.map((client,index)=>{
          if( client.id == id ) {
            clients.splice(index,1)
            let temp = [];
            clients.map((client)=>{
              temp.push(client)
            });
            setClients(temp);
          }    
        })
      },(error)=>{
        console.log('Erro ao excluir o usuario: ', error);
      })
    })
  }
  // only will update the component when the value
  // clients is changed
  useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql('SELECT * FROM usuarios ORDER BY nome', [], (_, results) => {
        let rows = results.rows.raw();
        let temp = [];
        rows.map((row) => {
          temp.push({name: row.nome, id: row.id});
        });
        setClients(temp);
      });
    });
  }, [props.clients]);

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
              <TouchableOpacity style={styles.btnRemove} onPress={async ()=>{deleteClient(item.id)}}>
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

const NewClient = ({navigation,clients,setClients}) => {
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
  //const {navigation, clients} = props;
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const insertNewClient = () => {
    db.transaction((tx) => {
      tx.executeSql(
        `INSERT INTO usuarios (nome,celular) VALUES (?,?)`,
        [clientName, clientPhone],
        () => {
          console.log(`Usuário ${clientName} inserido com sucesso`);
          //clients.push({name: clientName});
          setClients([...clients,{name:clientName}]);
          navigation.navigate('Clientes');
        },
        (error) => console.log('erro ao inserir o usuário ', error),
      );
    });
  };
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Cliente:</Text>
      <TextInput
        style={styles.input}
        onChangeText={(value) => setClientName(value)}
        placeholder="Digite o nome do cliente"
      />
      <Text style={styles.label}>Telefone:</Text>
      <TextInput
        style={styles.input}
        onChangeText={(value) => setClientPhone(value)}
        keyboardType="numeric"
        placeholder="Digite o telefone do cliente"
      />
      <TouchableOpacity
        style={styles.btnAddNewClient}
        onPress={insertNewClient}>
        <Text style={styles.btnAddNewClientText}>Cadastrar</Text>
      </TouchableOpacity>
    </View>
  );
};

const ProductSell = ({navigation, selectedProduct, orderItems, setOrderItems, orderInfo, setOrderInfo}) => {
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
    row: {
      flexDirection: 'row',
      marginLeft: '5%',
      marginRight: '5%',
      marginTop: 5,
      justifyContent: 'space-around'
    },
    checkboxText: {
      marginTop: 5
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
  const [paymentType, setPaymentType] = useState('NAO PROCESSADO');
  const [disableAddButton, setDisableAddButton] = useState(true);
  const [total, setTotal] = useState(0);

  const [report, setReport] = useState("Detalhes do Pedido: ");
  const [orderId, setOrderId ] = useState(0);

  const selectClientsList = async (isMounted) => {
    return new Promise((resolve, reject) => {
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
      console.log(rows);
      setClientsRows(rows);
    });
  };

  const selectProductsList = async (isMounted) => {
    return new Promise((resolve, reject) => {
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

  const selectOrderId = async (isMounted) => {
    db.transaction(tx=>{
      tx.executeSql("SELECT id + 1 as id FROM pedidos ORDER BY id DESC LIMIT 1",[],(_,results)=>{
        let rows = results.rows.raw();
        rows.map(row => setOrderId(row.id))
      })
    })
  }

  const formatToReal = (value) => {
    return "R$ " + value.toFixed(2).replace('.',',');
  }

  const newSell = () => {
    if( toggleCheckBox ) {

      if (orderInfo.cliente.celular == null || orderInfo.cliente.celular == "") {
        return ToastAndroid.show("O cliente não tem um celular cadastrado.",ToastAndroid.LONG);
      }
      setSendReport(true);
      let reportText = report;
      reportText += orderId + "\n";
      orderItems.map(item=>{
        reportText+= item.quantidade + " " + item.nome + " " + formatToReal( item.preco ) + " " + formatToReal( item.subtotal ) + "\n";
      })
      reportText += "Total do pedido: " + formatToReal(total);
      reportText = encodeURI(reportText);
      setReport(reportText);
    }
    else setSendReport(false);

    db.transaction((tx) => {
      console.log('iniciando a venda');
      tx.executeSql(
        'INSERT INTO pedidos (id_usuario,status) VALUES (?,?) ',
        [orderInfo.cliente.id, paymentType],
        () => console.log('pedido inserido na tabela'),
        (error) => console.log(error),
      );
      orderItems.map((produto) => {
        console.log(produto);
        tx.executeSql(
          'INSERT INTO pedido_itens (id_pedido,codigo_de_barras,quantidade,preco) VALUES (last_insert_rowid(),?,?,?)',
          [produto.codigo_de_barras, produto.quantidade, produto.preco],
          () =>
            console.log(
              produto.nome,
              produto.quantidade,
              produto.preco,
              'inserido na tabela pedido_itens',
            ),
          (error) => console.log('Erro ao inserir os itens do pedido ', error),
        );
        tx.executeSql(
          'UPDATE produtos SET quantidade=quantidade-? WHERE codigo_de_barras=?',
          [produto.quantidade, produto.codigo_de_barras],
          () => console.log('Quantidade atualizada no banco de dados'),
          (error) => console.log('Erro ao inserir os itens do pedido ', error),
        );
        console.log('transação finalizada');
      });
    });
  };

  useEffect(() => {
    selectProductsList();
    selectClientsList();
    selectOrderId();
  },[]);

  let productAmount = [<Picker.Item value="selecione" label="Selecione" />];
  for (let i = 1; i < 11; i++) {
    productAmount.push(
      <Picker.Item value={i} label={i.toString()} key={i.toString()} />,
    );
  }
  const [toggleCheckBox, setToggleCheckBox] = useState(false)
  const [sendReport, setSendReport] = useState(false);

  return (
    <View style={styles.container}>
      {/* Clients*/}
      <View style={styles.wrapperInput}>
        <Text style={styles.inputLabel}>Cliente:</Text>
        <Picker
          style={styles.picker}
          onValueChange={(value,index) => {
            let client = clientRows[index];
            console.log(client);
            orderInfo.cliente = {
              nome: client.nome,
              id: client.id,
              celular: client.celular
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
          selectedValue={parseInt(selectedProduct)}
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
    <View style={styles.row}>
      <RadioForm
        radio_props={[
          {label: 'á receber  ', value: 'NAO PROCESSADO'},
          {label: 'recebido', value: 'PROCESSADO'},
        ]}
        formHorizontal={true}
        onPress={(value) => {
          setPaymentType(value);
        }}
      />
      <CheckBox
        disabled={false}
        value={toggleCheckBox}
        onValueChange={(newValue) => setToggleCheckBox(newValue)}
      />
      <Text style={styles.checkboxText}>Whatsapp</Text>
      </View>
    {(sendReport && orderInfo.cliente.celular != null) ? (
      <View style={{display:'none'}}>
        <WebView source={{uri:'https://wa.me/55' + orderInfo.cliente.celular + '?text=' + report}} />
      </View>
    )
    : <View/> 
    }
    <TouchableOpacity
        style={styles.btnScan}
    onPress={() => {
      navigation.navigate('Escanear',{products: productRows});
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

        <TouchableOpacity
          style={styles.btnFinish}
          onPress={newSell}
          disabled={disableAddButton}>
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

const NewScan = ({navigation, selectedProduct, setSelectedProduct, orderInfo, setOrderInfo, route}) => {
  // const [count, setCount] = useState(0);
  // const {navigation, selectedProduct, setSelectedProduct, orderInfo, setOrderInfo} = props;
  return (
    <QRCodeScanner
      onRead={(e) => {
        const scanedValue = e.data;
        const {products} = route.params;
        let produto={};
        products.map(product=>{
          if ( product.codigo_de_barras == scanedValue ) {
            console.log('p',product)
            produto = {
              nome: product.nome,
              estoque: product.quantidade,
              codigo_de_barras: product.codigo_de_barras,
              preco: product.preco,
              quantidade: orderInfo.produto.quantidade ?? 0
            };
          }
        })
        console.log(orderInfo)
        setOrderInfo({...orderInfo,produto});
        setSelectedProduct(e.data);
        
        console.log('read product', typeof selectedProduct);
        navigation.navigate('Nova Venda', {selectedProduct: e.data});

        //reativa o scanner
        //QRCodeScanner.scanner.reactivate();
      }}
      // this allow scanner being reactivate programmatically
      ref={(node) => {
        QRCodeScanner.scanner = node;
      }}
      flashMode={RNCamera.Constants.FlashMode.auto}
      topContent={
        <TouchableOpacity>
          <Text style={{marginBottom: 60, fontWeight: 'bold'}}>
            Escaneie um produto
          </Text>
        </TouchableOpacity>
      }
    />
  );
};

  const db = SQLite.openDatabase(
    'candy.db',
    '1.0',
    'candy',
    20000,
    () => console.log('banco de dados aberto'),
    (error) => console.log('error', error),
  );

class DB {

  static initializeDB() {
    // usuarios
    db.executeSql(
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
    db.executeSql(
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
    db.executeSql(
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
    db.executeSql(
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

  static getProducts(callback) {
    db.transaction((tx) => {
      tx.executeSql('SELECT * FROM produtos', [], (_, results) => {
        let rows = results.rows.raw();
        callback(rows);
      });
    });
  }

  static getClients(callback) {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM usuarios',
        [],
        (_, results) => {
          let rows = results.rows.raw();
          callback(rows);
        },
        (error) => console.log(error),
      );
    });
  }

  static selectClients(callback) {
    db.transaction((tx) => {
      tx.executeSql('SELECT * FROM usuarios', [], (_, results) => {
        const rows = results.rows.raw();
        callback(rows);
      });
    });
  }
}

DB.initializeDB();

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

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.btn}
        onPress={() => navigation.navigate('Filtros')}>
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

const Filters = ({navigation}) => {
  const styles = {
    root: {
      backgroundColor: '#eae9ef',
      flex: 1,
    },
    flexRow: {
      flexDirection: 'row',
      justifyContent: 'center',
    },
    item: {
      marginLeft: '5%',
      marginRight: '5%',
      backgroundColor: '#fff',
      marginBottom: 5,
      date: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
      },
      text: {
        marginLeft: 10,
        fontSize: 15,
      },
      details: {
        marginTop: 5,
        marginBottom: 5,
        marginRight: 10,
        backgroundColor: 'blue',
        width: 'auto',
        padding: 5,
        btnDetails: {
          color: '#fff',
          textAlign: 'center',
          fontSize: 15,
          fontWeight: 'bold',
        },
      },
      pay: {
        marginTop: 5,
        marginBottom: 5,
        marginLeft: 10,
        backgroundColor: 'green',
        width: 'auto',
        padding: 5,
        btnPay: {
          color: '#fff',
          textAlign: 'center',
          fontSize: 15,
          fontWeight: 'bold',
        },
      },
    },
  };

  // 1 = Data, 2=Pedidos em aberto, 3=Pedidos finalizados
  const [filterOptionValue, setFilterOption] = useState('Selecione');
  const [filterItems, setFilterItems] = useState([]);

  const filterOptionList = ['Data', 'Pedidos em aberto', 'Pedidos finalizados'];

  const selectPaymentNotFinished = () => {
    db.transaction((tx) => {
      tx.executeSql(
        `
        SELECT pedidos.id as pedido_id, pedidos.data_pedido,usuarios.nome,SUM(pedido_itens.preco * pedido_itens.quantidade) as total_pedido FROM usuarios
          INNER JOIN pedidos ON pedidos.id_usuario=usuarios.id
          INNER JOIN pedido_itens ON pedido_itens.id_pedido=pedidos.id
        WHERE pedidos.status="NAO PROCESSADO"
        GROUP BY pedido_itens.id_pedido
        ORDER BY pedidos.id DESC`,
        [],
        (_, results) => {
          let rows = results.rows.raw();
          let orderItems = [];
          rows.map((row) => {
            console.log(row);
            orderItems.push(row);
          });
          setFilterItems(orderItems);
        },
        (error) => console.log(error),
      );
    });
  };

  const selectPaymentFinished = () => {
    db.transaction((tx) => {
      tx.executeSql(
        `
        SELECT pedidos.id as pedido_id, pedidos.data_pedido,usuarios.nome,SUM(pedido_itens.preco * pedido_itens.quantidade) as total_pedido FROM usuarios
          INNER JOIN pedidos ON pedidos.id_usuario=usuarios.id
          INNER JOIN pedido_itens ON pedido_itens.id_pedido=pedidos.id
        WHERE pedidos.status="PROCESSADO"
        GROUP BY pedido_itens.id_pedido
        ORDER BY pedidos.id DESC`,
        [],
        (_, results) => {
          let rows = results.rows.raw();
          let orderItems = [];
          rows.map((row) => {
            orderItems.push(row);
            console.log(row);
          });
          setFilterItems(orderItems);
        },
      );
    });
  };

  const selectByDate = () => {
    db.transaction((tx) => {
      tx.executeSql(
        `
        SELECT pedidos.id as pedido_id, pedidos.data_pedido,usuarios.nome,SUM(pedido_itens.quantidade * pedido_itens.preco) as total_pedido,
        pedido_itens.codigo_de_barras, pedido_itens.quantidade FROM usuarios
        INNER JOIN pedidos ON pedidos.id_usuario=usuarios.id
        INNER JOIN pedido_itens ON pedido_itens.id_pedido=pedidos.id
        GROUP BY pedido_itens.id_pedido
        ORDER BY pedidos.id DESC
      `,
        [],
        (_, results) => {
          console.log('finished');
          console.log('results', results);
          let rows = results.rows.raw();
          let orderItems = [];
          rows.map((row) => {
            console.log(row);
            orderItems.push(row);
          });
          setFilterItems(orderItems);
        },
      );
    });
  };

  const markAsPayed = (pedido_id) => {
    db.transaction((tx) => {
      tx.executeSql(
        'UPDATE pedidos SET status=? WHERE id=?',
        ['PROCESSADO', pedido_id],
        () => console.log('pedido marcado como pago', pedido_id),
        (error) => console.log(error),
      );
    });
    console.log(filterOptionValue, filterOptionList[1]);
    // update when user mark order as finished
    if (filterOptionValue == filterOptionList[1]) selectPaymentNotFinished();
  };

  const viewOrderItens = (pedido_id) => {
    console.log(pedido_id);
    navigation.navigate('Detalhes do Pedido', {pedido_id});
  };

  const styleOrderNotFinished = () => {
    if (filterOptionValue != filterOptionList[1]) {
      return {display: 'none'};
    } else {
      return styles.item.pay;
    }
  };

  return (
    <View style={styles.root}>
      <Picker
        selectedValue={filterOptionValue}
        onValueChange={(value) => {
          setFilterOption(value);

          switch (value) {
            case 'Selecione':
              break;
            case filterOptionList[0]:
              selectByDate();
              break;
            case filterOptionList[1]:
              selectPaymentNotFinished();
              break;
            case filterOptionList[2]:
              selectPaymentFinished();
              break;
            default:
              throw new Error(
                'Expected values:' + filterOptionList + ' got: ' + value,
              );
          }
        }}>
        <Picker.Item value={'Selecione'} label="Selecione" />
        <Picker.Item value={filterOptionList[0]} label="Data" key={1} />
        <Picker.Item
          value={filterOptionList[1]}
          label="Pedidos em aberto"
          key={2}
        />
        <Picker.Item
          value={filterOptionList[2]}
          label="Pedidos finalizados"
          key={3}
        />
      </Picker>

      <FlatList
        data={filterItems}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({item}) =>
          filterOptionValue != 'Selecione' ? (
            <View style={styles.item}>
              <Text style={styles.item.date}>
                {new Date(item.data_pedido).getDate() +
                  '/' +
                  new Date(item.data_pedido).getMonth() +
                  '/' +
                  new Date(item.data_pedido).getFullYear()}
              </Text>
              <Text style={styles.item.text}>id pedido: {item.pedido_id}</Text>
              <Text style={styles.item.text}>nome: {item.nome}</Text>
              <Text style={styles.item.text}>
                total: R${' '}
                {parseFloat(item.total_pedido).toFixed(2).replace('.', ',')}
              </Text>
              <View style={styles.flexRow}>
                <TouchableOpacity
                  style={styles.item.details}
                  onPress={() => viewOrderItens(item.pedido_id)}>
                  <Text style={styles.item.details.btnDetails}>Detalhes</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styleOrderNotFinished()}
                  onPress={() => markAsPayed(item.pedido_id)}>
                  <Text style={styles.item.details.btnDetails}>
                    Marcar como Pago
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View></View>
          )
        }
      />
    </View>
  );
};

const OrderDetails = ({route}) => {
  const styles = {
    container: {
      flex: 1,
      backgroundColor: '#eae9ef',
      paddingTop: 10,
    },
    productDetails: {
      padding: 10,
      backgroundColor: '#fff',
      marginLeft: '5%',
      marginRight: '5%',
    },
    header: {
      marginLeft: '5%',
      marginRight: '5%',
      backgroundColor: '#fff',
      padding: 10,
      fontSize: 15,
      fontWeight: 'bold',
    },
    footer: {
      marginLeft: '5%',
      marginRight: '5%',
      backgroundColor: '#fff',
      padding: 10,
      fontSize: 15,
      fontWeight: 'bold',
    },
  };
  const {pedido_id} = route.params;
  const [orderItems, setOrderItems] = useState([]);
  const [total, setTotal] = useState(0);

  const getOrderItems = (orderId) => {
    db.transaction((tx) => {
      console.log('iniciando transação');
      tx.executeSql(
        `SELECT pedido_itens.preco,pedido_itens.quantidade,produtos.nome FROM pedido_itens
          INNER JOIN produtos ON produtos.codigo_de_barras=pedido_itens.codigo_de_barras
        WHERE id_pedido=?`,
        [orderId],
        (_, results) => {
          let items = results.rows.raw();
          console.log(items);
          let pushItems = [];
          let local_total = 0;
          items.map((item) => {
            local_total += item.quantidade * item.preco;
            pushItems.push(item);
          });
          setOrderItems(pushItems);
          setTotal(local_total);
        },
        (error) => console.log(error),
      );
    });
  };
  useState(()=>{
    console.log(route.params);
    getOrderItems(pedido_id);
  }, pedido_id);

  // DB.db.transaction(
  //   (tx) => {
  //     tx.executeSql(
  //       'SELECT * FROM pedido_itens WHERE id_pedido=?',
  //       [pedido_id],
  //       (_, results) => {
  //         let rows = results.rows.raw();
  //       },
  //     ),
  //       (error) => console.log(error);
  //   },
  //   (error) => console.log(error),
  // );
  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        Quantidade Produto Preço Unitário Subtotal
      </Text>
      {orderItems.map((item) => (
        <View style={styles.productDetails}>
          <Text>
            {item.quantidade} {item.nome} R${' '}
            {parseFloat(item.preco).toFixed(2).replace('.', ',')} R${' '}
            {parseFloat(item.quantidade * item.preco)
              .toFixed(2)
              .replace('.', ',')}
          </Text>
        </View>
      ))}
      <Text style={styles.footer}>
        Total: R$ {total.toFixed(2).replace('.', ',')}
      </Text>
    </View>
  );
};

const App = () => {
  const Tab = createBottomTabNavigator();
  const Stack = createStackNavigator();
  const [products, setProducts] = useState([]);
  const [clients, setClients] = useState([{}]);
  const [selectedProduct, setSelectedProduct] = useState(0);
  const [orderItems, setOrderItems] = useState([]);
  const [orderInfo, setOrderInfo] = useState({});

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
          {(props) => <NewProduct {...props} products={products} setProducts={setProducts}/>}
        </Stack.Screen>
        <Stack.Screen name="Novo Cliente">
          {(props) => <NewClient {...props} clients={clients} setClients={setClients} />}
        </Stack.Screen>
        <Stack.Screen name="Nova Venda">
          {(props) => (
            <ProductSell
              {...props}
              selectedProduct={selectedProduct}
              setSelectedProduct={setSelectedProduct}
              orderItems={orderItems}
              setOrderItems={setOrderItems}
              orderInfo={orderInfo}
              setOrderInfo={setOrderInfo}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="Escanear">
          {(props) => (
            <NewScan
              {...props}
              selectedProduct={selectedProduct}
              setSelectedProduct={setSelectedProduct}
              orderInfo={orderInfo}
              setOrderInfo={setOrderInfo}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="Filtros" component={Filters} />
        <Stack.Screen name="Detalhes do Pedido" component={OrderDetails} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
