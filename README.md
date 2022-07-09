## **Amnetiot kids**
_Safe Tracking Application (by VVAMIR Company)_
__________________________________________________
#####  Tech Stack used in the Project
   - **[PHP Laravel Framework](https://laravel.com/)**
   - **PostgreSQL**
   - **Angularjs**
   - **[MQTT](https://mqtt.org/)**
   - **Websockets on [Ratchet Server](https://github.com/ratchetphp/Ratchet)**
   - **Nodejs**
   - **Google Maps / Leaflet Maps**
__________________________________________________
#####  Installation Process:
-  Open Terminal or CMD window and install next:
   - Install [Mosquitto MQTT brocker](https://mosquitto.org/) with `brew install mosquitto`  (for Mac users).
   - Install [_nodejs_](https://nodejs.org/en/).
   - Install _xxamp/laragon_ with _**php 7**_
   - Install [_composer_](https://getcomposer.org/download).
   - Install _php artisan_ `composer global require laravel/installer`
#####  Configuration Process:
- Modify _**php.ini**_ ( uncomment `extension=php_sockets.dll` )
- Extract or clone project in www/htdoc apache server folder.
- run `npm install` in project root folder.
- run `composer install` in laravel-backend folder to install laravel dependencies.
- run `php artisan` - validate if works, otherwise run composer command again.
* run migration with ```php artisan migrate```.

#####  Runtime Process:
* run `php artisan mqtt:serve`. -to run Real Time message broker service.
* run `php artisan chat:serve` - run execute WebSocket ratchet server.
* open another Terminal or CMD window, and run `php artisan serve` - now php laravel server is running.
* open Web Browser (Chrome / Mozilla) and past to url `http://localhost/angular-frontend/#/login` -  you should see login page. 
 * In case login page is not working (_Blueprint library issue_): 
   1. Open database with UI [pgadmin](https://www.pgadmin.org/) .
   2. Extend field ```remember_token``` character varying to  **1000** instead default **100**.
__________________________________________________
##### Database Model description:
 * ```AssetsResources``` - Amnetiot Organization is a default Organizaiton and operates as Warehouse for ```AssetsResources``` (devices).
 * ```AssetsCategories``` - **readonly** for all types of user **roles** of the application , also for internal use in code by developers used for various types of **devices**, **vehicles**, and **people**. 
 * ```AssetsCategories``` - can be inserted only by developer with new asset module (```AssetsVehicles```, ```AssetsGroups```, ```AssetsPersons```) accordingly it new category will be added in case it's required.
* ```Roles```  - administrators  "**Amnetiot users**" , **managers** - as administrators for other ```Organizations```, **users** - have permission to view (for instance kids parents).
* **Tip:** You can create and assign roles with your custom names for every organization.
* If you decide to create a new custom permission for it custom role , it will be useful only with interaction of the code and internal interference in application by developer.
* ```AssetsGroups``` - used for those who should be involved as tracked person (kids ) and watcher ( parent or other user). 
* Each manager of ```Organization``` can create this groups with users and assetsperson of this ```Organization``` only .
* Each manager also can create users for his ```Organization``` and assign them role any but not as Administrators .
__________________________________________________
##### Instructions for use:
1. Login as administrators ( email: `admin@gmail.com`  password: `123123`)
2. Add new ```Organization``` (any school name).
3. Create Users with role (```managers``` or ```users```,or ```custom role```) for it ```Organization```.
4. Add new ```AssetsResources``` (devices) and assign to it ```Organization```.
5. Login as manager of new created ```Organization``` in rule 2.
6. Add new ```AssetsPersons``` (kids)  and assign them any Category from humans Category. You can assign them only free ```AssetsResources``` that not assigned to other ```AssetPerson``` and only with Category that related to ```humans_devices``` .
Same for Vehicles. 
7. Create ```AssetsVehicles``` and assign them multiple ```AssetsResources``` from ```AssetsCategory``` (vehicles_devices) that you added in rule 4. 
8. Create ```AssetsGroup``` and chose who that tracked person and who is the **watcher** on this ```AssetsPerson``` (usually a kid parent).
9. Manager Can see every created ```AssetsGroup``` and every report of ```AssetsPersons``` assigned ```AssetsResources``` in rule 6 on the AVL tracking map.
10. User as **watcher** can see on AVL tracking map only those ```AssetsPersons``` who with him was assigned ```AssetsGroups``` in rule 8 .
11. In case there was no reports - there is no options for to view in AVL tracking map and their dropdown menu.
12. In case there was any report by any organizations resource **BY DEFAULT** you will see on the AVL tracking map - only it last reported location of it resource.
__________________________________________________     
##### About AVL Tracking:
- Report to Avl Table should include ```resource_id``` field ( RFID Tag / Device ).
- Validate that ```resource_id``` of the Device (```AssetsResource```) presents in ```AssetsResource``` as owned resource 
- by any Organization with the next SQL statement: 
 __(SELECT id FROM assets_resources WHERE imea =your imea)__
- (Skip in case ```id != null```) - means the resource is present in database and seems to be valid.
  - Store your resource information to ```assets_resources``` table :
    * Assign it to ```organization_id``` with value 1 (as unknown organization) .
    * Assign ```assets_category_id``` with value 1 (as unknown device category). 
    * At the same time return ```resource_id``` with the next SQL statement : 
`INSERT INTO assets_resources (imei,organization_id,assets_category_id) values (your imei, 1, 1) RETURNING id`
- Now you able to report AVL track with it ```resource_id``` .


