<?php 
/**
 * Action.php
 * 
 * 处理请求
 * 
 * @author 熊猫小A
 */
if (!defined('__TYPECHO_ROOT_DIR__')) exit;
?>

<?php 
class ExSearch_Action extends Widget_Abstract_Contents implements Widget_Interface_Do 
{
    /**
     * 返回请求的 JSON
     * 
     * @access public
     */
    public function action(){
        $action = isset($_GET['action']) ? trim($_GET['action']) : '';

        switch ($action) {
        case 'rebuild':
            Typecho_Widget::widget('Widget_User')->to($user);
            if (!$user->have() || !$user->hasLogin()) {
                $this->response->setStatus(403);
                echo 'Invalid Request';
                return;
            }

            ExSearch_Plugin::save();
?>
            重建索引完成，<a href="<?php Helper::options()->siteUrl(); ?>" target="_self">回到首页</a>。
<?php
            return;

        case 'api':
            header('Content-Type: application/json; charset=UTF-8');

            $key = isset($_GET['key']) ? trim($_GET['key']) : '';
            if (empty($key)) {
                echo json_encode(array());
                return;
            }

            $db = Typecho_Db::get();
            $row = $db->fetchRow($db->select()->from('table.exsearch')
                    ->where('table.exsearch.key = ?', $key)
                    ->limit(1));

            if (empty($row) || empty($row['data'])) {
                echo json_encode(array());
                return;
            }

            echo $row['data'];
            return;

        default:
            header('Content-Type: application/json; charset=UTF-8');
            echo json_encode(array());
            return;
        }
    }
}
