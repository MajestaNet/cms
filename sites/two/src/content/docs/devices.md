---
title: Devices
description: Climate, television, vacuum, and ESPHome stay off until a binding on this Mac is enabled.
cmsPage: /devices
---

Climate, television, vacuum, and ESPHome packages ship in Majesta Two and stay off until a binding under the data directory enables them. Copying a package into the tree does not turn it on. The phone and watch can ask for `home-action` only after that binding exists. Until then, a device sentence is refused.

`two adapters` prints the menu and writes nothing. The operator window’s Adapters page runs the same enablement steps.

Each binding is a file under `$TWO_DATA_DIR/devices/`. Example files are in the source repo under `config/devices/`. Set `enabled: true` only after the addresses and names are yours. Restart `two worker` after the file changes. The CLI that sends a sentence (`two climate`, `two tv`, `two vacuum`) talks only to the control API. The worker opens the device.

## Air conditioners

Closed tools are `climate.read`, `climate.set_setpoint`, and `climate.set_mode`. A zone may list spoken aliases such as `lounge`. An alias is not an address.

A Mitsubishi Electric unit with a MAC-568IF-E, MAC-578IF-E, or MAC-588IF-E interface can use ECHONET Lite after you enable it in the Mitsubishi Wi-Fi Control app. It ships off. The same file also covers a Japan class `0x0130` adapter from Daikin, Panasonic, Hitachi, Toshiba, Fujitsu General, or Sharp. Copy `config/devices/climate-echonet.example.yaml` to `$TWO_DATA_DIR/devices/climate.yaml`, set each unit’s private IPv4 address, then set `enabled: true`. Use whole degrees. The Mac and the units must be on the same private LAN, without AP isolation, and UDP port 3610 must be allowed. ECHONET Lite has no password.

These do not answer this transport: MAC-567IF-E and MELCloud, MAC-577IF-2E and MAC-587, and vendor-cloud apps (ONECTA, Comfort Cloud, airCloud, Home AC Control, FGLair, COCORO AIR, Smart M-Air). Naming one of them `manufacturer` does not make this client speak it. Home Assistant remains the other climate binding. An older infrared LG unit uses an ESPHome node instead. Use one climate file.

## ESPHome

An RF, IR, or BLE board is a node, not an air conditioner. Copy `config/devices/esphome.example.yaml` to `$TWO_DATA_DIR/devices/esphome.yaml`. Put the ESPHome API encryption key in the environment variable named by `key_env` (default `TWO_ESPHOME_KEY`). Do not put the key in the binding. `two esphome entities` lists object ids and writes nothing. The climate slot stays off until `climate.yaml` is enabled.

## Televisions

Samsung, LG webOS, and TCL Roku sets share `config/devices/tv.example.yaml` copied to `$TWO_DATA_DIR/devices/tv.yaml`. One file may mix those brands. Closed tools include `tv.read`, `tv.set_power`, `tv.open`, and `tv.set_volume`. A volume above the bound band waits for a digest.

Samsung and LG need a pair step (`two tv pair` or Pair on the Adapters page) so the set can approve this Mac. TCL Roku does not use `two tv pair`. `two tv apps` lists application ids you can copy into the binding. `two tv send` talks only to the control API.

## Vacuums

Ecovacs only. Nothing is installed on the robot. Copy `config/devices/vacuum.example.yaml` to `$TWO_DATA_DIR/devices/vacuum.yaml`. The slot stays off until that file is enabled and names at least one robot.

Create a server access key at [open.ecovacs.com](https://open.ecovacs.com) (or `open.ecovacs.cn` only if the ECOVACS HOME app is on the mainland host) with the same account that already shows the robots. Store it as `ECO_API_KEY` in `$TWO_DATA_DIR/env`. Do not use the app password and do not commit the key. `two vacuum robots` prints account nicknames and writes nothing. Approve a binding that uses those exact nicknames. Room cleaning, maps, fan speed, and mop control are not in this client.

`two vacuum send --text "start the <your robot id> vacuum"` and `two vacuum send --text "dock all vacuums"` are the closed actions. A sentence that does not request `vacuum.read`, `vacuum.clean`, or `vacuum.dock` does not change the robot.
