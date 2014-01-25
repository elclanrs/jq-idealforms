<?php

sleep(2);

$users = array('elclanrs', 'peter', 'john', 'mike');

echo json_encode(! in_array($_POST['username'], $users));

exit;
