import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal, Pressable, Switch } from 'react-native';
import Toggle from "react-native-toggle-element";
import axios from 'axios';


const server_port = 65432;
const server_addr = '192.168.0.12';

export default function App() {
  const [modalVisible, setModalVisible] = useState(false);
  const [isOn, setIsOn] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isConnected, setIsConnected] = useState();
  const [temperature, setTemperature] = useState();

  const switchLight = async (on) => {
    try {
      const response = await axios.post('http://192.168.0.12:65432/light', {
        on,
      });
      console.log('Response:', response.data);
    } catch (error) {
      console.error('Error:', error.message);
    }
  };

  const getTemperature = async () => {
    const response = await axios.get('http://192.168.0.12:65432/temperature');
    setTemperature(response.data['temperature'])
  }

  useEffect(() => {
    if (modalVisible) {
      axios.get('http://192.168.0.12:65432/ping').then((res) => {
        if (res.data === 'pong') {
          setIsConnected(true);
        } else {
          setIsConnected(false);
        }
      }).catch((err) => {
        alert(err);
        setIsConnected(false);
      })
    }
  }, [modalVisible])


  useEffect(() => {
    axios.get('http://192.168.0.12:65432/light').then((res) => {
      setIsOn(res.data['on'])
    });
    const intervalId = setInterval(getTemperature, 5000);
    return () => {
      clearInterval(intervalId)
    }
  }, [])


  return (
    <View style={[styles.container, { flexDirection: 'column' }, isDarkMode && styles.darkMode]}>
      <View style={[styles.container, { flex: 0.1 }]}></View>
      <View style={[styles.container, isDarkMode && styles.darkMode, { flex: 0.8 }]}>
        <Toggle
          value={isOn}
          onPress={(val) => {
            console.log(val);
            switchLight(val);
            setIsOn(val);
          }}
          trackBar={{
            width: 300,
            height: 110,
            radius: 100,
            borderWidth: 15,
            activeBackgroundColor: '#49CB5F',
            inActiveBackgroundColor: '#DDDDDD'
          }}
          thumbButton={{
            width: 120,
            height: 120,
            radius: 100,
            activeBackgroundColor: '#fff',
            inActiveBackgroundColor: '#fff',
          }}
        />
      </View>
      <View styles={[styles.container, { flex: 0.1 }]}>
        <Pressable
          style={[styles.button, styles.buttonOpen]}
          onPress={() => setModalVisible(true)}>
          <Text style={styles.textStyle}>Settings</Text>
        </Pressable>

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            Alert.alert('Modal has been closed.');
            setModalVisible(!modalVisible);
          }}>
          <TouchableOpacity
            style={styles.transparentContainer}
            activeOpacity={1}
            onPressOut={() => { setModalVisible(false) }}
          >
            <View style={styles.centeredView}>
              <View style={[styles.modalView, { flex: 0.2, paddingHorizontal: 100 }]}>
                <Text style={[styles.modalText, {marginBottom: 20}]}>Settings</Text>
                <View style={{ flexDirection: 'row' }}>
                  <Text style={{ fontWeight: 'bold' }}>CPU Temp </Text>
                  <Text>{temperature === undefined ? 'Loading...' : ((temperature * 9 / 5) + 32).toFixed(2)}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 20 }}>
                  <Text style={[styles.modalText, {  marginRight: 10 }]}>Dark Mode</Text>
                  <Switch value={isDarkMode} onChange={(value) => setIsDarkMode(!isDarkMode)} />
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={[styles.modalText, { marginRight: 10 }]}>Connection Status</Text>
                 {isConnected !== undefined ? <Text style={{color: isConnected ? 'green': 'red'}}>{isConnected ? 'Online' : 'Offline'}</Text> : <Text>Loading...</Text>}
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  transparentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  darkMode: {
    backgroundColor: '#212121'
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 50,
    padding: 20,
    marginBottom: 50,
    paddingHorizontal: 100,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: '#2196F3',
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    textAlign: 'center',
    fontWeight: 'bold',
  },
});