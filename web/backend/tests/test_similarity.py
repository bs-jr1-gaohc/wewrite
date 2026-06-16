import similarity_check as sc

def test_identical_is_one():
    t = "今天我们聊聊智能体落地的真实情况，数据很有意思。"
    assert sc.similarity(t, t) == 1.0

def test_completely_different_is_low():
    a = "智能体项目在企业里大量被砍掉了"
    b = "周末去爬山看到漫山遍野的杜鹃花"
    assert sc.similarity(a, b) < 0.1

def test_paraphrase_is_middle():
    a = "2026年被吹成智能体爆发年，但真正落地的不到四分之一。"
    b = "都说2026是智能体爆发年，可落地的连四分之一都不到。"
    s = sc.similarity(a, b)
    assert 0.1 < s < 0.95

def test_normalize_ignores_markdown_and_space():
    a = "## 标题\n\n这是 一段 正文。"
    b = "标题这是一段正文"
    assert sc.similarity(a, b) > 0.9

def test_max_pairwise():
    texts = ["完全一样的内容啊啊啊", "完全一样的内容啊啊啊", "毫不相干的另一段文字内容"]
    assert sc.max_pairwise(texts) == 1.0
