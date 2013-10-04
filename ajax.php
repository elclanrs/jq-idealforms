<?php

sleep(2);

$users = ['elclanrs', 'peter', 'john', 'mike'];

echo json_encode(! in_array($_POST['username'], $users));

exit;
