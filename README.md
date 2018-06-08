## Installing Mosquitto MQTT brocker on Windows 10 .
 * Execute in PowerShell as administrator 
 `Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Windows-Subsystem-Linux`. 
 * Go to Windows Firewall with Advanced Security  (choose Advanced Settings in Firewall prompt)
 * Click Inbound Rules then on right hand pane  add a New Rule 
   This will bring up a  New Rules wizard, just follow the prompt entering the following
 * Set rule type as Port.
 * Enter a Specific local port your server is running under WSL, in this case, 1883
 * Choose TCP port
 * In the next tab Action tab, choose Allow the connection
 * Next where this rule Applies choose all appropriate Domains, such as Public (entire Internet) or Private (just my local LAN traffic)    or check all for complete access from outside.
   and finally just name the Rule (Mosquitto port 1883) or something similar and press Finish.
* Download and Install [mosquitto-1.4.14-install-cygwin.exe](https://mosquitto.org/download/) or from mqtt install folder
* Fix installation by copying dlls to `C:\Program File(x86)\mosquitto` 
* Now run the cygwin build exe installer again. It will run normally this time. click on Finish.
 !! By default the service will not be started. Start the service !!
* Go to services from Start Menu and find 'Mosquitto Broker'.
* In order to validate, go to command line and type the following command: `netstat -a` (command to find out which all ports are running   in the system) find running 1883 port, that's it.

* Install xxamp/laragon with php 7
* Download Install [composer](https://getcomposer.org/download).
* Install php artisan `composer global require laravel/installer`
* Modify php.ini ( uncomment `extension=php_sockets.dll` )
* Install nodejs.
* Extract or clone project in www/htdoc apache server folder
* Install project dependendies 
 1.`npm install` in project root folder.
 2.`composer install` in laravel-backend folder
 3. validate `php artisan` if works otherwise laravel dependencies again
 4. run migration with `php artisan migrate`
 5. run `php artisan mqtt:serve`
 6. run web socket ratchet server `php artisan chat:serve`
 7. open new tab and run `php artisan serve` now php laravel server is running
 8. open `http://localhost/angular-frontend/#/login` in browser and login !!! in case login not works (Blueprint library issue) - open database with UI [pgadmin](https://www.pgadmin.org/) and extend `remember_token' character varying to 1000 instead 100.


## Instructions 
Instructions and description how to use Amnetiot Kids
 * AssetsResources - Amnetiot Organization is Default Organizaiton and operates as Warehouse for AssetsResources ( Devices ) 
 * AssetsCategories -(only for VIEW to all types of user roles of the application and also for internal use in code by developers) used     for different types of devices,vehicles,and people . 
 * AssetsCategories can be added only by developer when new module (for instance : AssetsVehicles,AssetsGroups,AssetsPersons) will be    added accordingly new category will be added and only if it's required.
* Roles  - administrators its Amnetiot users , managers - its administrators for other Organizations, users - have permission to view ..for instance kids parents .
* You can create and assign roles with your custom names for every organization .
* If you create new custom permission for it custom role ,it will be useful only with interaction of the code and internal interference in application by developer.
* AssetsGroups - used for those who should be involved as tracked person (kids ) and watcher ( parent or other user) . Each manager of * Organization can create this groups with users and assetsperson of this Organization only .
 Each manager also can create users for his Organization and assign them role any but not as Administrators .


### How to begin with Application:
* Login as administrators ( email: `admin@gmail.com`  password: `123123`)
* Add new Organization
* Create Users with role (managers or users,or custom role) for it Organization
* Add new AssetsResources (devices ) and assign to it Organization
* Login as manager of new created Organization in rule 2.
* Add new AssetsPersons(kids)  and assign them any Category from humans Category. You can assign them only free  AssetsResources that not assigned to other AssetPerson and only with Category that related to humans_devices .
Same for Vehicles. 
* Create AssetsVehicles and assign them multiple AssetsResources from AssetsCategory (vehicles_devices) that you added in rule 4. 
* Create AssetsGroup and chose who that tracked person and who is the watcher on this AssetsPerson .
* Manager Can see every created AssetsGroup and every report of AssetsPersons assigned AssetsResources in rule 6 on the AVL tracking map.
* User as watcher can see on AVL tracking map only those  AssetsPersons who with him was assigned AssetsGroups in rule 8 .
* If there was no reports - there is no options for to view in AVL tracking map and their dropdown up menus
* If there was any report by any organizations resource BY DEFAULT you will see on the avl map only last reported location of it resource.
                



 ### ABOUT AVL TRACKING
* Report to Avl Table should include resource_id field
##### Before you report - 
* Validate that resource_id of the Device(AssetsResource) presents in AssetsResource as owned resource by any Organization
  With the next SQL statement : 
`( SELECT id FROM assets_resources WHERE imea =your imea )`
If there is no id value (or its value null) So this resource not presents in Database and seems to be as unknown resource . 
So store your resource information to assets_resources table And assign it to organization_id with value 1 ( as unknown organization ) and assets_category_id with value 1 (as unknown device category) and in the same time return resource_id with the next SQL statement :
`INSERT INTO assets_resources (imei,organization_id,assets_category_id) values (your imei , 1 , 1 ) RETURNING id`
    3 . Now you can report to AVL track with resource_id


