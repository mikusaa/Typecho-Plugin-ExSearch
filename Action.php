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

        case 'query':
            header('Content-Type: application/json; charset=UTF-8');

            $key = isset($_GET['key']) ? trim($_GET['key']) : '';
            $query = isset($_GET['q']) ? trim($_GET['q']) : '';
            if (empty($key) || empty($query)) {
                echo json_encode(array('posts' => array(), 'pages' => array()));
                return;
            }

            if (!$this->isValidKey($key)) {
                echo json_encode(array('posts' => array(), 'pages' => array()));
                return;
            }

            echo json_encode($this->query($query));
            return;

        default:
            header('Content-Type: application/json; charset=UTF-8');
            echo json_encode(array());
            return;
        }
    }

    private function isValidKey($key)
    {
        $db = Typecho_Db::get();
        $row = $db->fetchRow($db->select('table.exsearch.key')->from('table.exsearch')
                ->where('table.exsearch.key = ?', $key)
                ->limit(1));

        return !empty($row);
    }

    private function query($query)
    {
        $db = Typecho_Db::get();
        $keywords = $this->parseKeywords($query);
        $result = array(
            'posts' => array(),
            'pages' => array()
        );

        if (empty($keywords)) {
            return $result;
        }

        $select = $db->select()->from('table.contents')
                ->where('table.contents.status = ?', 'publish')
                ->where('table.contents.password IS NULL')
                ->where('table.contents.type IN ?', array('post', 'page'))
                ->order('table.contents.created', Typecho_Db::SORT_DESC)
                ->limit(200);

        foreach ($keywords as $keyword) {
            $like = '%' . addcslashes($keyword, '%_\\') . '%';
            $select->where('(table.contents.title LIKE ? OR table.contents.text LIKE ?)', $like, $like);
        }

        $rows = $db->fetchAll($select);
        $items = array();
        foreach ($rows as $row) {
            $text = $this->plainText($row['text']);
            $title = $this->plainText($row['title']);
            $score = $this->score($title, $text, $keywords);
            if ($score < 1) {
                continue;
            }

            $widget = $this->contentWidget($row['cid']);
            $items[] = array(
                'title' => $row['title'],
                'path' => $widget->permalink,
                'type' => $row['type'],
                'date' => date('c', $row['created']),
                'preview' => $this->preview($text, $keywords),
                'score' => $score
            );
        }

        usort($items, array($this, 'sortItems'));
        $items = array_slice($items, 0, 20);

        foreach ($items as $item) {
            $type = $item['type'] === 'page' ? 'pages' : 'posts';
            unset($item['type']);
            unset($item['score']);
            $result[$type][] = $item;
        }

        return $result;
    }

    private function parseKeywords($query)
    {
        $parts = preg_split('/\s+/u', trim($query));
        $keywords = array();

        foreach ($parts as $part) {
            if ($part !== '') {
                $keywords[] = $part;
            }
        }

        return $keywords;
    }

    private function plainText($text)
    {
        return trim(preg_replace('/\s+/u', ' ', strip_tags($text)));
    }

    private function score($title, $text, array $keywords)
    {
        $score = 0;
        foreach ($keywords as $keyword) {
            $needle = mb_strtolower($keyword, 'UTF-8');
            $titleCount = substr_count(mb_strtolower($title, 'UTF-8'), $needle);
            $textCount = substr_count(mb_strtolower($text, 'UTF-8'), $needle);
            $score += $titleCount * 3 + $textCount;
        }

        return $score;
    }

    private function preview($text, array $keywords)
    {
        $position = false;
        foreach ($keywords as $keyword) {
            $position = mb_stripos($text, $keyword, 0, 'UTF-8');
            if ($position !== false) {
                break;
            }
        }

        if ($position === false) {
            $position = 0;
        }

        $start = $position > 30 ? $position - 30 : 0;
        $preview = mb_substr($text, $start, 120, 'UTF-8');

        if ($start > 0) {
            $preview = '...' . $preview;
        }

        if ($start + 120 < mb_strlen($text, 'UTF-8')) {
            $preview .= '...';
        }

        return $preview;
    }

    private function contentWidget($cid)
    {
        $db = Typecho_Db::get();
        $widget = Typecho_Widget::widget('Widget_Abstract_Contents');
        $db->fetchRow(
            $widget->select()->where('cid = ?', $cid)->limit(1),
            array($widget, 'push'));
        return $widget;
    }

    private function sortItems($a, $b)
    {
        if ($a['score'] === $b['score']) {
            return strtotime($b['date']) - strtotime($a['date']);
        }

        return $b['score'] - $a['score'];
    }
}
