(function () {
    const app = require('electron').remote.app;
    const bw = require('electron').remote.getCurrentWindow();
    const dialog = require('electron').remote.dialog;
    const Menu = require('electron').remote.Menu;
    const MenuItem = require('electron').remote.MenuItem;
    const path = require('path');
    const fs = require('fs');
    const workPath = path.join(app.getPath("appData"), 'NiceMark');
    const cachePath = path.join(workPath, "workspace.json");
    var tree = new Tree();
    var oWorkspaceSearchInput = document.getElementById("workspace-search-input");
    var oWorkspaceSearchBox = document.getElementById("workspace-search-box");
    var oMain = document.getElementById("main");
    var oWorkspaceTree = document.getElementById("workspace-tree");
    var oAddLocalFolderDialog = document.getElementById("add-local-folder-dialog");
    var oLocalFolderInput = document.getElementById("local-folder-input");
    var oLocalNameInput = document.getElementById("local-name-input");
    var oLocalTip = document.getElementById("local-tip");
    var oNewDocDialog = document.getElementById("new-doc-dialog");
    var oDocName = document.getElementById("doc-name-input");
    var oDocNameTip = document.getElementById("doc-name-tip");

    var workspace = {};

    fs.access(workPath, fs.F_OK, function (err) {
        if (err) {
            fs.mkdir(workPath, function (err) {
            });
        }
    });
    fs.readFile(cachePath, 'utf8', function (err, data) {
        if (!err && data){
            tree.appendNode(tree.getJsonFiles("."), null, true);
        }
    });

    tree.into(oWorkspaceTree);

    oWorkspaceSearchInput.onfocus = function () {
        utils.Animation.animate('expoEaseOut', 0, 250, 300, {
            'start': function () {
                oWorkspaceSearchBox.style.height = 0;
                oWorkspaceSearchBox.style.display = 'block';
            },
            'update': function (value) {
                oWorkspaceSearchBox.style.height = value + 'px';
            }
        });
    };
    oWorkspaceSearchInput.onblur = function () {
        utils.Animation.animate('expoEaseOut', 250, 0, 300, {
            'finish': function () {
                oWorkspaceSearchBox.style.display = 'none';
            },
            'update': function (value) {
                oWorkspaceSearchBox.style.height = value + 'px';
            }
        });
    };
    workspace.toggle = function () {
        if (workspace.isOpen) {
            workspace.close();
        } else {
            workspace.open();
        }
    };

    workspace.open = function () {
        workspace.isOpen = true;
        utils.Animation.animate('expoEaseOut', parseInt(oMain.style.left) || -25, 0, 300, {
            'start': function () {
                var oCover = utils.showCover();
                oCover.one('click', function () {
                    workspace.close();
                });
            },
            'update': function (value) {
                oMain.style.left = value + '%';
            }
        });
    };

    workspace.close = function () {
        workspace.isOpen = false;
        utils.Animation.animate('expoEaseOut', parseInt(oMain.style.left || -25), -25, 300, {
            'start': function () {
                utils.dismissCover();
            },
            'update': function (value) {
                oMain.style.left = value + '%';
            }
        });
    };

    workspace.cache = function (callback) {
        fs.writeFile(cachePath, JSON.stringify(tree.top), {
            'encoding': 'utf8',
            'flag': 'w+'
        }, function (err) {
            if (err) {
                utils.toast(err, 2, callback);
                return;
            }
            if (callback instanceof Function) {
                callback();
            }
        });
    };

    workspace.initLocalFolderDialog = function () {
        oLocalFolderInput.value = oLocalNameInput.value = null;
        oLocalTip.textContent = '??????????????????????????????';
        oLocalTip.replaceAllClass('color-tip');
    };

    workspace.showAddLocalFolderDialog = function () {
        workspace.initLocalFolderDialog();
        utils.showDialog({
            positive: function () {
                var path = workspace.checkLocalFolder();
                if (!path) return;
                var name = workspace.checkLocalName();
                if (!name) return;
                workspace.addLocalFolder(path, name);
            }
        }, oAddLocalFolderDialog);
    };

    workspace.chooseLocalFolder = function () {
        dialog.showOpenDialog({
            properties: ['openDirectory']
        }, function (paths) {
            if (!paths) return;
            oLocalTip.textContent = '??????????????????????????????';
            oLocalTip.replaceAllClass('color-tip');
            oLocalFolderInput.value = paths[0];
            oLocalNameInput.value = paths[0].substring(paths[0].lastIndexOf(path.sep) + 1);
        });
    };

    workspace.checkLocalFolder = function () {
        if (!oLocalFolderInput.value) {
            oLocalTip.textContent = '???????????????';
            oLocalTip.replaceAllClass('color-warning');
            return;
        }
        return oLocalFolderInput.value;
    };

    workspace.checkLocalName = function () {
        if (!oLocalNameInput.value) {
            oLocalTip.textContent = '?????????????????????';
            oLocalTip.replaceAllClass('color-warning');
            return;
        }
        oLocalTip.textContent = '??????????????????????????????';
        oLocalTip.replaceAllClass('color-tip');
        return oLocalNameInput.value;
    };

    workspace.addLocalFolder = function (path, name) {
        tree.appendNode({
            name: name,
            path: path,
            children: []
        });
        utils.dismissDialog(oAddLocalFolderDialog);
        workspace.cache();
    };

    /*??????????????????*/
    tree.on('toggle', function (node) {
        if (!node.toggle) return;
        listNode(node);
    });

    tree.on('dbclick', openDoc);

    function openDoc(forced) {              //??????????????????
        if (tree.currentNode.children) {
            tree.toggle(tree.currentNode);
            return;
        }
        if (forced) {
            editor.readFile(tree.currentNode.path);
            utils.dismissDialog();
            workspace.toggle();
            return;
        }
        if (editor.isClean()) {
            editor.readFile(tree.currentNode.path);
            workspace.toggle();
            return;
        }
        utils.showDialog({
            title: '????????????',
            content: '?????????????????????????????????????????????',
            type: 1,
            positive: {
                text: '??????',
                callback: function () {
                    editor.save(function () {
                        openDoc(true);
                    });
                }
            },
            negative: {
                text: '?????????',
                callback: function () {
                    openDoc(true);
                }
            }
        });
    }

    tree.on('append', function (node, ele) {
        bindNodeMenu(ele.querySelector('.tree-node-container'), node);
    });

    /*????????????*/
    const folderMenuTemplate = [{
        label: '??????',
        click: newDoc
    }, {
        label: '??????',
        click: refreshFolder
    }, {
        label: '??????',
        submenu: [{
            label: '??????',
            type: 'checkbox',
            click: todo
        }, {
            label: '????????????',
            type: 'checkbox',
            click: todo
        }, {
            label: '??????',
            type: 'checkbox',
            click: todo
        }, {
            label: '??????',
            type: 'checkbox',
            click: todo
        }, {
            type: 'separator',
            click: todo
        }, {
            label: '??????',
            type: 'checkbox',
            click: todo
        }, {
            label: '??????',
            type: 'checkbox',
            click: todo
        }]
    }, {
        label: '??????????????????'
    }];

    const fileMenuTemplate = [{
        label: '??????',
        click: openDoc
    }, {
        label: '??????????????????',
        click: todo
    }, {
        type: 'separator',
        click: todo
    }, {
        label: '??????',
        click: todo
    }, {
        label: '??????',
        click: todo
    }, {
        label: '??????',
        click: todo
    }, {
        label: '??????',
        click: todo
    }, {
        label: '?????????',
        click: todo
    }];

    const folderMenu = Menu.buildFromTemplate(folderMenuTemplate);
    const fileMenu = Menu.buildFromTemplate(fileMenuTemplate);

    /**
     * ??????????????????
     * @param nodeContainer
     * @param node
     */
    function bindNodeMenu(nodeContainer, node) {
        // nodeContainer.addEventListener('contextmenu', function (e) {
        //     e.preventDefault();
        //     e.stopPropagation();
        //     var menu = node.children ? folderMenu : fileMenu;
        //     menu.popup(bw);
        // }, false)
        tree.on("rtclick", function (node, e) {
            e.preventDefault();
            e.stopPropagation();
            var menu = node.children ? folderMenu : fileMenu;
            menu.popup(bw);
        });
    }

    /**
     * ?????????????????????
     */
    function refreshFolder() {
        listNode(tree.currentNode, true);
    }

    /**
     * ????????????
     */
    function newDoc() {
        oDocNameTip.textContent = '';
        if (!oDocName.oninput) {
            oDocName.oninput = function () {
                oDocNameTip.textContent = '';
            }
        }
        utils.showDialog({
            positive: function () {
                var docName = oDocName.value;
                if (!docName) {
                    oDocNameTip.textContent = '?????????????????????';
                    oDocNameTip.replaceAllClass('color-warning');
                    return;
                }
                if (!docName.match(/\.(md|markdown)$/)) {
                    docName += '.md';
                }
                var docPath = path.join(tree.currentNode.path, docName);
                fs.writeFile(docPath, '', {
                    'encoding': 'utf8',
                    'flag': 'wx'
                }, function (err) {
                    if (err) {
                        if (err.code == 'EEXIST') {
                            oDocNameTip.textContent = '???????????????';
                        } else {
                            oDocNameTip.textContent = '??????????????????';
                            utils.showToast(err, 1);
                        }
                        oDocNameTip.replaceAllClass('color-warning');
                        return;
                    }
                    refreshFolder();
                    utils.dismissDialog(oNewDocDialog);
                });
            }
        }, oNewDocDialog);
    }

    /**
     * ???????????????
     * @param node
     * @param isNotLazy
     */
    function listNode(node, isNotLazy) {
        if (!node || !node.children || !isNotLazy && node.children.length != 0) return; // ?????????
        tree.removeChildren(node);
        var nodeArray = [];
        var listFile = fs.readdirSync(node.path);
        for (var i in listFile) {
            var childName = listFile[i];
            var childPath = path.join(node.path, childName);
            var childStat = fs.statSync(childPath);
            if (!childStat.isDirectory() && !path.extname(childName).match(/\.(md|markdown)$/)) continue;
            nodeArray.push({
                'name': childName,
                'children': childStat.isDirectory() ? [] : null,
                'path': childPath
            });
        }
        nodeArray.sort(compareNode);
        for (i in nodeArray) {
            tree.appendNode(nodeArray[i], node);
        }
    }

    /**
     * ?????????????????????
     * @param node1
     * @param node2
     * @returns {number}
     */
    function compareNode(node1, node2) {
        if (node1.children && !node2.children) {
            return -1;
        }
        if (!node1.children && node2.children) {
            return 1;
        }
        return node1.name.localeCompare(node2.name);
    }

    function todo() {
        utils.showToast("?????????????????????...", 1);
    }

    /*????????????*/
    const workspaceMenu = new Menu();
    workspaceMenu.append(new MenuItem({
        label: '??????????????????',
        click: workspace.showAddLocalFolderDialog
    }));

    oWorkspaceTree.onmousedown = function (ev) {
        if (ev.button == 2) {
            workspaceMenu.popup(bw);
        }
    };

    this.workspace = workspace;
})();