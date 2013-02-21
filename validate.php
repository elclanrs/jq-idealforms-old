<?php
$names = array('mike', 'john', 'louis', 'james');
sleep(3);
echo json_encode(!in_array($_POST['username'], $names));
