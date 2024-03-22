import { cleanup, render } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { Form } from "../../../src/components/form";

afterAll(cleanup);

describe("Form", () => {
  test("with footer", async () => {
    const user = userEvent.setup();

    let called = 0;
    const onSubmit = () => {
      called += 1;
      return Promise.resolve();
    };

    const component = render(
      <Form onSubmit={onSubmit}>
        <Form.Body>
          <input type="text" />
        </Form.Body>
        <Form.Footer>
          <button type="submit">Yoo</button>
        </Form.Footer>
      </Form>,
    );

    expect(component.container).toBeInTheDocument();
    /**
     * ```html
     * <form>
     *   <Page>
     *     ...
     *   </Page>
     * </form>
     * ```
     */
    const form = component.container.children[0];

    /**
     * ```html
     * <div>
     *   <Body></Body>
     *   <Footer></Footer>
     * </div>
     * ```
     */
    const page = form.children[0];

    expect(page.children.length).toBe(2);

    const body = page.children[0].children[0];
    expect(body.classList.contains("flex")).toBe(true);

    const submit = page.querySelector("button");
    expect(submit).not.toBeNull();
    if (submit) {
      expect(submit.textContent).toBe("Yoo");

      expect(called).toBe(0);
      await user.click(submit);
      expect(called).toBe(1);
    }
  });

  test("without footer", async () => {
    const user = userEvent.setup();

    let called = 0;
    const onSubmit = () => {
      called += 1;
      return Promise.resolve();
    };

    const component = render(
      <Form onSubmit={onSubmit}>
        <Form.Body>
          <input type="text" />
        </Form.Body>
      </Form>,
    );

    expect(component.container).toBeInTheDocument();
    /**
     * ```html
     * <form>
     *   <Page>
     *     ...
     *   </Page>
     * </form>
     * ```
     */
    const form = component.container.children[0];

    /**
     * ```html
     * <div>
     *   <Body></Body>
     *   <Footer></Footer>
     * </div>
     * ```
     */
    const page = form.children[0];

    expect(page.children.length).toBe(2);

    const submit = page.querySelector("button");
    expect(submit).not.toBeNull();
    if (submit) {
      expect(submit.textContent).toBe("Submit");

      expect(called).toBe(0);
      await user.click(submit);
      expect(called).toBe(1);
    }
  });

  test("with header", () => {
    const component = render(
      <Form onSubmit={() => Promise.resolve()}>
        <Form.Header>Hi there</Form.Header>
        <Form.Body>
          <input type="text" />
        </Form.Body>
      </Form>,
    );

    expect(component.container).toBeInTheDocument();
    /**
     * ```html
     * <form>
     *   <Page>
     *     ...
     *   </Page>
     * </form>
     * ```
     */
    const form = component.container.children[0];

    /**
     * ```html
     * <div>
     *   <Header></Header>
     *   <Body></Body>
     *   <Footer></Footer>
     * </div>
     * ```
     */
    const page = form.children[0];

    expect(page.children.length).toBe(3);
  });

  test("Pass through", () => {
    const component = render(
      <Form onSubmit={() => Promise.resolve()}>
        <Form.Body flexCol={false}>
          <input type="text" />
        </Form.Body>
      </Form>,
    );

    expect(component.container).toBeInTheDocument();
    /**
     * ```html
     * <form>
     *   <Page>
     *     ...
     *   </Page>
     * </form>
     * ```
     */
    const form = component.container.children[0];

    /**
     * ```html
     * <div>
     *   <Body></Body>
     *   <Footer></Footer>
     * </div>
     * ```
     */
    const page = form.children[0];

    expect(page.children.length).toBe(2);
    const body = page.children[0].children[0];
    expect(body.classList.contains("flex")).toBe(false);
  });

  test("submission with error", async () => {
    const user = userEvent.setup();

    const component = render(
      <Form onSubmit={() => Promise.reject(new Error("This failed"))}>
        <Form.Body>
          <input type="text" />
        </Form.Body>
      </Form>,
    );

    expect(component.container).toBeInTheDocument();
    /**
     * ```html
     * <form>
     *   <Page>
     *     ...
     *   </Page>
     * </form>
     * ```
     */
    const form = component.container.children[0];
    let error = form.querySelector("div[role='alert']");
    expect(error).toBeNull();

    const submit = form.querySelector("button");
    expect(submit).not.toBeNull();
    if (submit) await user.click(submit);

    error = form.querySelector("div[role='alert']");
    expect(error).not.toBeNull();

    if (error) expect(error.children[0].textContent).toBe("Error: This failed");
  });
});
