const Bluez = require('..');

const bluetooth = new Bluez();

const shutdown = async () => bluetooth.bus.disconnect();

const init = async (config) => {
  await bluetooth.init();
  const adapter = await bluetooth.getAdapter(config.adapter);
  await adapter.StartDiscovery();
  console.log("Discovering");
};

// Register callback for new devices
bluetooth.on('device', (address, props) => {
  // apply some filtering
  if (props.Name && props.RSSI > -40) {
    handleDevice(address, props).catch(console.error);
  }
});

const handleDevice = async (address, props) => {
  // Get the device interface
  const device = await bluetooth.getDevice(address);
  
  // Subscribe to property updates (e.g. RSSI and AdvertisingFlags)
  device.on('PropertiesChanged', async (device, iface, propsAdded, propsRemoved) => {
    console.log(`onPropertiesChanged address=${(await device.Address())}`, propsAdded, propsRemoved);
  });
  
  console.log(`Subscribed to Device name=${props.Name} address=${props.Address}`);
};

// =======

process.on("SIGINT", () => {
  shutdown();
  process.removeAllListeners("SIGINT");
});

init({adapter: 'hci1'});
