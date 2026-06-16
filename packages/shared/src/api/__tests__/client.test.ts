import { createApiClient } from "../client";
import apiClient, { setApiClient } from "../client";

describe("createApiClient", () => {
  const baseURL = "http://localhost:3000/api";

  describe("request interceptor", () => {
    it("attaches the Authorization header when getToken returns a token", () => {
      const client = createApiClient({
        baseURL,
        getToken: () => "abc123",
        onUnauthorized: () => {},
      });

      const config = client.defaults;
      // Headers are attached via the request interceptor, not defaults,
      // so we invoke the interceptor handler directly via the manager.
      const requestInterceptor = (client.interceptors.request as any).handlers[0];
      const resultConfig = requestInterceptor.fulfilled({ headers: {} });

      expect(resultConfig.headers.Authorization).toBe("Bearer abc123");
      expect(config.baseURL).toBe(baseURL);
    });

    it("does not attach an Authorization header when getToken returns an empty string", () => {
      const client = createApiClient({
        baseURL,
        getToken: () => "",
        onUnauthorized: () => {},
      });

      const requestInterceptor = (client.interceptors.request as any).handlers[0];
      const resultConfig = requestInterceptor.fulfilled({ headers: {} });

      expect(resultConfig.headers.Authorization).toBeUndefined();
    });
  });

  describe("response interceptor — 401 handling", () => {
    const getResponseErrorHandler = (client: ReturnType<typeof createApiClient>) =>
      (client.interceptors.response as any).handlers[0].rejected;

    it("calls onUnauthorized with 'token_missing' when the API returns that error code", async () => {
      const onUnauthorized = jest.fn();
      const client = createApiClient({ baseURL, getToken: () => "", onUnauthorized });
      const rejected = getResponseErrorHandler(client);

      await expect(
        rejected({ response: { status: 401, data: { error: "token_missing" } } })
      ).rejects.toBeTruthy();

      expect(onUnauthorized).toHaveBeenCalledWith("token_missing");
    });

    it("calls onUnauthorized with 'invalid_token' when the API returns that error code", async () => {
      const onUnauthorized = jest.fn();
      const client = createApiClient({ baseURL, getToken: () => "", onUnauthorized });
      const rejected = getResponseErrorHandler(client);

      await expect(
        rejected({ response: { status: 401, data: { error: "invalid_token" } } })
      ).rejects.toBeTruthy();

      expect(onUnauthorized).toHaveBeenCalledWith("invalid_token");
    });

    it("calls onUnauthorized with 'token_expired' when the API returns that error code", async () => {
      const onUnauthorized = jest.fn();
      const client = createApiClient({ baseURL, getToken: () => "", onUnauthorized });
      const rejected = getResponseErrorHandler(client);

      await expect(
        rejected({ response: { status: 401, data: { error: "token_expired" } } })
      ).rejects.toBeTruthy();

      expect(onUnauthorized).toHaveBeenCalledWith("token_expired");
    });

    it("defaults to 'invalid_token' when a 401 has no recognized error code", async () => {
      const onUnauthorized = jest.fn();
      const client = createApiClient({ baseURL, getToken: () => "", onUnauthorized });
      const rejected = getResponseErrorHandler(client);

      await expect(
        rejected({ response: { status: 401, data: {} } })
      ).rejects.toBeTruthy();

      expect(onUnauthorized).toHaveBeenCalledWith("invalid_token");
    });

    it("does not call onUnauthorized for non-401 errors", async () => {
      const onUnauthorized = jest.fn();
      const client = createApiClient({ baseURL, getToken: () => "", onUnauthorized });
      const rejected = getResponseErrorHandler(client);

      await expect(
        rejected({ response: { status: 500, data: {} } })
      ).rejects.toBeTruthy();

      expect(onUnauthorized).not.toHaveBeenCalled();
    });

    it("does not call onUnauthorized when there is no response (network error)", async () => {
      const onUnauthorized = jest.fn();
      const client = createApiClient({ baseURL, getToken: () => "", onUnauthorized });
      const rejected = getResponseErrorHandler(client);

      await expect(rejected({ message: "Network Error" })).rejects.toBeTruthy();

      expect(onUnauthorized).not.toHaveBeenCalled();
    });
  });
});

describe("default apiClient singleton", () => {
  const baseURL = "http://localhost:3000/api";

  it("throws a descriptive error when used before setApiClient is called", () => {
    expect(() => apiClient.get("/exercises")).toThrow(/setApiClient/);
  });

  it("forwards calls to the instance registered via setApiClient", async () => {
    const instance = createApiClient({ baseURL, getToken: () => "", onUnauthorized: () => {} });
    const getSpy = jest.spyOn(instance, "get").mockResolvedValue({ data: [] });

    setApiClient(instance);

    await apiClient.get("/exercises");

    expect(getSpy).toHaveBeenCalledWith("/exercises");
  });

  it("forwards calls to a newly registered instance after setApiClient is called again", async () => {
    const first = createApiClient({ baseURL, getToken: () => "", onUnauthorized: () => {} });
    const second = createApiClient({ baseURL, getToken: () => "", onUnauthorized: () => {} });
    const secondGetSpy = jest.spyOn(second, "get").mockResolvedValue({ data: [] });

    setApiClient(first);
    setApiClient(second);

    await apiClient.get("/muscles");

    expect(secondGetSpy).toHaveBeenCalledWith("/muscles");
  });
});
