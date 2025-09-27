-- 1. Insert the following new record to the account table Note: 
-- The account_id and account_type fields should handle their own values 
-- and do not need to be part of this query.: 
-- Tony, Stark, tony@starkent.com, Iam1ronM@n

INSERT INTO public.account(
account_firstname,
account_lastname,
account_email,
account_password
)
VALUES ('Tony', 'Stark', 'tony@starkent.com', 'Iam1ronM@n')


-- 2. Modify the Tony Stark record to change the account_type to "Admin".
update public.account
set account_type = 'Admin'
where account_id = 1;

-- 3. Delete the Tony Stark record from the database.
DELETE FROM public.account
where account_id = 1;

-- 4. Modify the "GM Hummer" record to read "a huge interior" 
-- rather than "small interiors" using a single query. 
-- Explore the PostgreSQL Replace function
-- Do NOT retype the entire description as part of the query.. 
-- It needs to be part of an Update query 
-- as shown in the code examples of this SQL Reading\

UPDATE public.inventory
SET inv_description = replace(inv_description, 'small interiors', 'a huge interior')
WHERE inv_make = 'GM'
AND inv_model = 'Hummer';

-- 5. Use an inner join to select the make and model fields 
-- from the inventory table and the classification name field 
-- from the classification table for inventory items 
-- that belong to the "Sport" category. 
-- Two records should be returned as a result of the query.

SELECT inv.inv_make, inv.inv_model
FROM public.inventory AS inv
INNER JOIN public.classification AS cla
	ON inv.classification_id = cla.classification_id
WHERE cla.classification_name = 'Sport';

-- 6. Update all records in the inventory table
--  to add "/vehicles" to the middle of the file path 
-- in the inv_image and inv_thumbnail columns using a single query.
-- When done the path for both inv_image and inv_thumbnail 
-- should resemble this example: /images/vehicles/a-car-name.jpg

UPDATE public.inventory
SET inv_image = replace(inv_image, '/images', '/images/vehicles'),
	inv_thumbnail = replace(inv_thumbnail, '/images', '/images/vehicles');
