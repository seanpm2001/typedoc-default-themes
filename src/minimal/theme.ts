/// <reference path="../../typings/typedoc.d.ts" />

export class Theme extends td.DefaultTheme
{
    /**
     * Create a new DefaultTheme instance.
     *
     * @param renderer  The renderer this theme is attached to.
     * @param basePath  The base path of this theme.
     */
    constructor(renderer:td.Renderer, basePath:string) {
        super(renderer, basePath);

        renderer.removePlugin(td.AssetsPlugin);
        renderer.removePlugin(td.JavascriptIndexPlugin);
        renderer.removePlugin(td.NavigationPlugin);
        renderer.removePlugin(td.TocPlugin);

        renderer.on(td.Renderer.EVENT_BEGIN_PAGE, this.onRendererBeginPage, this);
    }


    /**
     * Test whether the given path contains a documentation generated by this theme.
     *
     * @param path  The path of the directory that should be tested.
     * @returns     TRUE if the given path seems to be a previous output directory,
     *              otherwise FALSE.
     */
    isOutputDirectory(path:string):boolean {
        if (!td.FS.existsSync(td.Path.join(path, 'index.html'))) return false;
        return true;
    }


    /**
     * Map the models of the given project to the desired output files.
     *
     * @param project  The project whose urls should be generated.
     * @returns        A list of [[UrlMapping]] instances defining which models
     *                 should be rendered to which files.
     */
    getUrls(project:td.ProjectReflection):td.UrlMapping[] {
        var urls = [];
        urls.push(new td.UrlMapping('index.html', project, 'index.hbs'));

        project.url = 'index.html';
        project.anchor = null;
        project.hasOwnDocument = true;

        project.children.forEach((child) => {
            td.DefaultTheme.applyAnchorUrl(child, project);
        });

        return urls;
    }


    /**
     * Triggered before a document will be rendered.
     *
     * @param page  An event object describing the current render operation.
     */
    private onRendererBeginPage(page:td.OutputPageEvent) {
        var model = page.model;
        if (!(model instanceof td.Reflection)) {
            return;
        }

        page.toc = new td.NavigationItem();
        Theme.buildToc(page.model, page.toc);
    }


    /**
     * Create a toc navigation item structure.
     *
     * @param model   The models whose children should be written to the toc.
     * @param parent  The parent [[Models.NavigationItem]] the toc should be appended to.
     */
    static buildToc(model:td.DeclarationReflection, parent:td.NavigationItem) {
        var children = model.children || [];
        children.forEach((child:td.DeclarationReflection) => {
            var item = td.NavigationItem.create(child, parent, true);
            Theme.buildToc(child, item);
        });
    }
}